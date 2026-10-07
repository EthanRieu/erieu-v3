<template>
    <div ref="container" class="signature-scene relative w-full h-full overflow-hidden select-none">
        <!-- Scène WebGL (chargée à l'approche du viewport) -->
        <canvas ref="canvas" v-show="ready" class="absolute inset-0 block w-full h-full" role="img"
            :aria-label="$t('home.box.ariaLabel')"></canvas>

        <!-- État initial et repli (WebGL indisponible, chargement échoué, contexte perdu) : la box actuelle -->
        <div v-show="!ready"
            class="flex flex-col justify-center items-center h-full text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
            <span>{{ $t('home.box.title') }}</span>
            <div class="text-sm mt-2 text-gray-700">{{ tapToLoad ? $t('home.box.tapHint') : $t('home.box.hint') }}</div>
        </div>

        <div v-show="ready"
            class="absolute bottom-3 left-0 right-0 text-center text-xs sm:text-sm font-semibold text-gray-800 pointer-events-none">
            {{ $t('home.box.hint') }}
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { prefersReducedMotion } from '~/composables/useRevealAnimations'

/**
 * Le tracé signature de la home extrudé en tube 3D (dégradé #2F4A4F → #899EA2), réactif au curseur.
 *
 * Performance : seul un sous-ensemble de `three` (lib/three-subset.js, tree-shaké) est importé dynamiquement,
 * hors bundle initial. Sur pointeur fin (souris/trackpad) il est chargé quand la box approche du viewport ;
 * sur écran tactile ou en mode économie de données, uniquement au premier tap sur la box (le parsing de
 * three coûte plusieurs secondes de thread principal sur un mobile d'entrée de gamme). La boucle de rendu
 * ne tourne que si la box est visible et l'onglet actif, le pixel ratio est plafonné, et tout est libéré
 * au démontage (géométrie, matériau, renderer, contexte WebGL, observers, listeners).
 * Dégradation : sans WebGL, le contenu de repli reste affiché tel quel.
 * prefers-reduced-motion : pas de rotation automatique, réponse au curseur amortie.
 */

const props = defineProps({
    // Attribut `d` du path SVG à extruder
    path: { type: String, required: true }
})

const container = ref(null)
const canvas = ref(null)
const ready = ref(false)
// Vrai sur écran tactile / économie de données : la scène n'est chargée qu'au premier tap
const tapToLoad = ref(false)

const COLOR_START = '#2F4A4F'
const COLOR_END = '#899EA2'
const MAX_PIXEL_RATIO = 1.5

let renderer = null
let scene = null
let camera = null
let group = null
let geometry = null
let material = null

let rafId = null
let isVisible = false
let isPageVisible = true
let loading = false
let disposed = false
let intersectionObserver = null
let resizeObserver = null
let contextLostHandler = null
const listeners = []

const reducedMotion = prefersReducedMotion()
const pointer = { x: 0, y: 0, active: false }
const rotation = { x: 0, y: 0 }
let needsRender = true

const listen = (target, type, fn, options) => {
    target.addEventListener(type, fn, options)
    listeners.push({ target, type, fn, options })
}

const supportsWebGL = () => {
    try {
        const probe = document.createElement('canvas')
        return !!(window.WebGLRenderingContext && (probe.getContext('webgl2') || probe.getContext('webgl')))
    } catch {
        return false
    }
}

// Échantillonne le path SVG en points 2D (nécessite un <svg> attaché au document)
const samplePath = (d, count = 220) => {
    const svgNS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(svgNS, 'svg')
    const pathEl = document.createElementNS(svgNS, 'path')
    pathEl.setAttribute('d', d)
    svg.appendChild(pathEl)
    svg.setAttribute('aria-hidden', 'true')
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'
    document.body.appendChild(svg)

    const length = pathEl.getTotalLength()
    const points = []
    for (let i = 0; i <= count; i++) {
        const point = pathEl.getPointAtLength((i / count) * length)
        points.push({ x: point.x, y: point.y })
    }
    document.body.removeChild(svg)
    return points
}

const fitCamera = () => {
    if (!camera || !container.value) return
    const width = container.value.clientWidth || 1
    const height = container.value.clientHeight || 1
    camera.aspect = width / height
    // Distance nécessaire pour que la courbe (2 unités de large, ~1 de haut) tienne dans le cadre
    const verticalFov = (camera.fov * Math.PI) / 180
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect)
    const margin = 0.25
    camera.position.z = Math.max(
        (1 + margin) / Math.tan(horizontalFov / 2),
        (0.55 + margin) / Math.tan(verticalFov / 2)
    )
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    needsRender = true
}

const buildScene = async () => {
    const THREE = await import('~/lib/three-subset')
    if (disposed || !canvas.value) return

    const points = samplePath(props.path)
    const xs = points.map((p) => p.x)
    const ys = points.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const width = maxX - minX
    const height = maxY - minY
    const scale = 2 / Math.max(width, height)

    // Normalisation dans [-1, 1], léger relief en z pour donner de la profondeur
    const vectors = points.map((p, i) => new THREE.Vector3(
        (p.x - (minX + width / 2)) * scale,
        -(p.y - (minY + height / 2)) * scale,
        Math.sin((i / points.length) * Math.PI * 2) * 0.12
    ))

    const curve = new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.5)
    geometry = new THREE.TubeGeometry(curve, 240, 0.045, 12, false)

    // Dégradé le long du tube via les couleurs de sommets (u = position le long de la courbe)
    const colorStart = new THREE.Color(COLOR_START)
    const colorEnd = new THREE.Color(COLOR_END)
    const uv = geometry.attributes.uv
    const vertexCount = geometry.attributes.position.count
    const colors = new Float32Array(vertexCount * 3)
    const tmp = new THREE.Color()
    for (let i = 0; i < vertexCount; i++) {
        tmp.copy(colorStart).lerp(colorEnd, uv.getX(i))
        colors[i * 3] = tmp.r
        colors[i * 3 + 1] = tmp.g
        colors[i * 3 + 2] = tmp.b
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.65, metalness: 0.05 })

    scene = new THREE.Scene()
    group = new THREE.Group()
    group.add(new THREE.Mesh(geometry, material))
    scene.add(group)

    // Éclairage doux pour préserver le teal du dégradé (des intensités plus fortes le délavent en gris)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x2f4a4f, 0.7))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
    keyLight.position.set(2, 3, 4)
    scene.add(keyLight)

    camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)

    renderer = new THREE.WebGLRenderer({
        canvas: canvas.value,
        antialias: true,
        alpha: true,
        powerPreference: 'low-power'
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
    renderer.setClearColor(0x000000, 0)

    contextLostHandler = (event) => {
        event.preventDefault()
        ready.value = false
        stopLoop()
    }
    canvas.value.addEventListener('webglcontextlost', contextLostHandler)

    resizeObserver = new ResizeObserver(() => fitCamera())
    resizeObserver.observe(container.value)
    fitCamera()

    ready.value = true
    startLoop()
}

const load = async () => {
    if (loading || renderer || disposed) return
    // Sonde WebGL ici (et non au montage) : la création d'un contexte est coûteuse sous rendu logiciel
    if (!supportsWebGL()) return
    loading = true
    try {
        await buildScene()
    } catch (error) {
        // Repli silencieux : la box CSS reste affichée
        console.warn('[SignatureScene] WebGL scene unavailable', error)
        ready.value = false
    } finally {
        loading = false
    }
}

const tick = (time) => {
    if (!isVisible || !isPageVisible || disposed) {
        rafId = null
        return
    }

    const seconds = time * 0.001
    const idleY = reducedMotion ? 0 : Math.sin(seconds * 0.5) * 0.12
    const idleX = reducedMotion ? 0 : Math.cos(seconds * 0.35) * 0.06
    const targetY = pointer.x * 0.35 + idleY
    const targetX = -pointer.y * 0.25 + idleX
    const ease = reducedMotion ? 0.03 : 0.06

    const dx = targetX - rotation.x
    const dy = targetY - rotation.y
    if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005 || needsRender) {
        rotation.x += dx * ease
        rotation.y += dy * ease
        group.rotation.set(rotation.x, rotation.y, 0)
        renderer.render(scene, camera)
        needsRender = false
    }

    rafId = requestAnimationFrame(tick)
}

const startLoop = () => {
    if (rafId === null && renderer && isVisible && isPageVisible) {
        needsRender = true
        rafId = requestAnimationFrame(tick)
    }
}

const stopLoop = () => {
    if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
    }
}

const updatePointer = (clientX, clientY) => {
    const rect = container.value.getBoundingClientRect()
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = ((clientY - rect.top) / rect.height) * 2 - 1
    pointer.active = true
}

const resetPointer = () => {
    pointer.x = 0
    pointer.y = 0
    pointer.active = false
}

onMounted(() => {
    if (!import.meta.client || !container.value) return
    // Test léger au montage (présence de l'API) : la création réelle d'un contexte WebGL, coûteuse
    // sous rendu logiciel, n'a lieu qu'au chargement effectif de la scène (voir load)
    if (!('WebGLRenderingContext' in window)) return

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const saveData = !!(navigator.connection && navigator.connection.saveData)
    tapToLoad.value = !finePointer || saveData

    // Suivi de visibilité : pilote le chargement (pointeur fin) et la pause de la boucle de rendu
    intersectionObserver = new IntersectionObserver((entries) => {
        const entry = entries[0]
        isVisible = entry.isIntersecting
        if (isVisible) {
            if (!renderer && !tapToLoad.value) load()
            else if (renderer) startLoop()
        }
    }, { rootMargin: '200px' })
    intersectionObserver.observe(container.value)

    // Tactile : chargement explicite au premier tap sur la box
    if (tapToLoad.value) {
        const loadOnTap = () => {
            container.value.removeEventListener('pointerdown', loadOnTap)
            if (!renderer) load()
        }
        listen(container.value, 'pointerdown', loadOnTap, { passive: true })
    }

    listen(container.value, 'pointermove', (event) => updatePointer(event.clientX, event.clientY), { passive: true })
    listen(container.value, 'pointerleave', resetPointer)
    listen(container.value, 'touchmove', (event) => {
        const touch = event.touches[0]
        if (touch) updatePointer(touch.clientX, touch.clientY)
    }, { passive: true })
    listen(container.value, 'touchend', resetPointer)
    listen(document, 'visibilitychange', () => {
        isPageVisible = document.visibilityState === 'visible'
        if (isPageVisible) startLoop()
    })
})

onBeforeUnmount(() => {
    disposed = true
    stopLoop()
    if (intersectionObserver) intersectionObserver.disconnect()
    if (resizeObserver) resizeObserver.disconnect()
    listeners.forEach(({ target, type, fn, options }) => target.removeEventListener(type, fn, options))
    listeners.length = 0
    if (canvas.value && contextLostHandler) canvas.value.removeEventListener('webglcontextlost', contextLostHandler)
    if (geometry) geometry.dispose()
    if (material) material.dispose()
    if (renderer) {
        renderer.dispose()
        renderer.forceContextLoss()
    }
    renderer = scene = camera = group = geometry = material = null
})
</script>

<style scoped>
.signature-scene {
    cursor: crosshair;
    touch-action: pan-y;
}
</style>
