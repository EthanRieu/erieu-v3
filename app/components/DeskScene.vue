<template>
    <div ref="container" class="desk-scene relative w-full h-full select-none">
        <!-- Scène WebGL (chargée à l'approche du viewport) -->
        <canvas ref="canvas" v-show="ready" class="absolute inset-0 block w-full h-full" role="img"
            :aria-label="$t('home.desk.ariaLabel')"></canvas>

        <!-- État initial et repli (WebGL indisponible, chargement échoué, contexte perdu) -->
        <div v-show="!ready"
            class="flex flex-col justify-center items-center h-full text-lg sm:text-xl md:text-2xl font-semibold secondary-color">
            <span>{{ $t('home.desk.title') }}</span>
            <div class="text-sm mt-2 opacity-80">{{ tapToLoad ? $t('home.desk.tapToLoad') : $t('home.desk.loading') }}</div>
        </div>

        <div v-show="ready"
            class="absolute bottom-0 left-0 right-0 text-center text-xs sm:text-sm font-semibold secondary-color pointer-events-none">
            {{ tapToLoad ? $t('home.desk.hintTouch') : $t('home.desk.hint') }}
        </div>

        <!-- Signification de l'objet sous le pointeur -->
        <div v-if="label" class="desk-label absolute pointer-events-none px-2 py-1 rounded text-xs sm:text-sm font-semibold"
            :style="{ left: `${labelPosition.x}px`, top: `${labelPosition.y}px` }" aria-hidden="true">
            {{ label }}
        </div>

        <!-- Équivalents clavier / lecteur d'écran des clics sur l'écran et la lampe -->
        <template v-if="ready">
            <button type="button" class="sr-only" @click="interact('screen')">{{ $t('home.desk.nextScreen') }}</button>
            <button type="button" class="sr-only" @click="interact('lamp')">
                {{ lampOn ? $t('home.desk.lampOff') : $t('home.desk.lampOn') }}
            </button>
        </template>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '~/composables/useRevealAnimations'

/**
 * Mini bureau isométrique (public/models/desk.glb, assemblé dans blender/desk.blend à partir du « Furniture Kit »
 * de Kenney, CC0, recoloré aux couleurs du site). Il pivote légèrement avec le curseur ; au survol, chaque objet se
 * soulève et affiche ce qu'il représente ; au clic, il réagit : l'écran change de contenu, la lampe s'allume ou
 * s'éteint, la chaise tourne, les plantes et les livres frémissent, le clavier et la souris s'enfoncent.
 *
 * Performance (même stratégie que ToolboxScene) : three (sous-ensemble lib/three-desk.js) et le .glb (~90 Ko) sont
 * chargés à la demande — à l'approche du viewport sur pointeur fin, au premier tap sur tactile / économie de
 * données. La boucle de rendu ne tourne que si la scène est visible et l'onglet actif ; tout est libéré au démontage.
 * prefers-reduced-motion : pas de balancement automatique, réactions au clic sans rebond.
 */

const { t, locale } = useI18n()

const container = ref(null)
const canvas = ref(null)
const ready = ref(false)
const tapToLoad = ref(false)
const lampOn = ref(true)
const label = ref(null)
const labelPosition = ref({ x: 0, y: 0 })

const MODEL_URL = '/models/desk.glb'
// Nœuds interactifs du modèle et clé i18n de leur étiquette
const ITEMS = {
    screen: 'screen',
    keyboard: 'keyboard',
    mouse: 'mouse',
    lamp: 'lamp',
    books: 'books',
    plant: 'plant',
    bigplant: 'plant',
    chair: 'chair'
}
const SLIDE_COUNT = 3
const MAX_PIXEL_RATIO = 1.5
// Orientation de repos (vue de trois quarts) et amplitude de la rotation au curseur
const BASE_YAW = 0.3
const POINTER_YAW = 0.3
const HOVER_LIFT = 0.025
const COLORS = { bg: '#2F4A4F', fg: '#EEEEEE', muted: '#899EA2', accent: '#9FD3B5', key: '#F4E4B8' }

let THREE = null
let renderer = null
let scene = null
let camera = null
let room = null
let raycaster = null
let items = []
let hovered = null
let screenTexture = null
let screenCanvas = null
let slide = 0
let lampLight = null
let lampMaterial = null

const pointer = { x: 0, active: false }
const pointerNdc = { x: 0, y: 0 }
const pointerLocal = { x: 0, y: 0 }
let yaw = BASE_YAW
let hoverDirty = false
let labelTimer = null

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

const setCursor = (value) => {
    if (container.value && container.value.style.cursor !== value) container.value.style.cursor = value
}

/* ------------------------------------------------------------------ */
/* Contenu de l'écran                                                  */
/* ------------------------------------------------------------------ */

// Dalle du moniteur ~1,7:1 ; dessinée en 2x pour rester nette
const drawScreen = () => {
    if (!screenCanvas) return
    const context = screenCanvas.getContext('2d')
    const { width, height } = screenCanvas
    const font = getComputedStyle(container.value).fontFamily
    context.fillStyle = COLORS.bg
    context.fillRect(0, 0, width, height)
    context.textBaseline = 'middle'

    if (slide === 0) {
        context.textAlign = 'center'
        context.fillStyle = COLORS.fg
        context.font = `700 210px ${font}`
        context.fillText('ERIEU', width / 2, height * 0.44)
        context.fillStyle = COLORS.muted
        context.font = `600 56px ${font}`
        context.fillText(t('home.desk.screen.role'), width / 2, height * 0.74)
    } else if (slide === 1) {
        // Objet JS coloré façon éditeur
        context.textAlign = 'left'
        context.font = '600 58px ui-monospace, SFMono-Regular, Menlo, monospace'
        const lines = [
            [['const ', COLORS.muted], ['ethan', COLORS.fg], [' = {', COLORS.muted]],
            [['  role: ', COLORS.fg], ["'full-stack'", COLORS.accent], [',', COLORS.muted]],
            [['  school: ', COLORS.fg], ["'ESGI'", COLORS.accent], [',', COLORS.muted]],
            [['  next: ', COLORS.fg], [`'${t('home.desk.screen.next')}'`, COLORS.key]],
            [['}', COLORS.muted]]
        ]
        lines.forEach((parts, index) => {
            let x = 80
            parts.forEach(([text, color]) => {
                context.fillStyle = color
                context.fillText(text, x, 130 + index * 92)
                x += context.measureText(text).width
            })
        })
    } else {
        context.textAlign = 'center'
        context.fillStyle = COLORS.accent
        context.beginPath()
        context.arc(width / 2, height * 0.3, 34, 0, Math.PI * 2)
        context.fill()
        context.fillStyle = COLORS.fg
        context.font = `700 96px ${font}`
        context.fillText(t('home.desk.screen.status'), width / 2, height * 0.56)
        context.fillStyle = COLORS.muted
        context.font = `600 52px ${font}`
        context.fillText(t('home.desk.screen.rhythm'), width / 2, height * 0.76)
    }
    if (screenTexture) screenTexture.needsUpdate = true
}

/* ------------------------------------------------------------------ */
/* Construction                                                        */
/* ------------------------------------------------------------------ */

const fitCamera = () => {
    if (!camera || !container.value) return
    const width = container.value.clientWidth || 1
    const height = container.value.clientHeight || 1
    camera.aspect = width / height
    // Sphère englobante du bureau (rayon fixe : la rotation au curseur ne doit pas changer le cadrage)
    const target = new THREE.Vector3(0, 0.38, 0.05)
    const radius = 0.7
    const direction = new THREE.Vector3(0, 0.75, 1).normalize()
    const verticalFov = (camera.fov * Math.PI) / 180
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect)
    const distance = Math.max(radius / Math.sin(verticalFov / 2), radius / Math.sin(horizontalFov / 2))
    camera.position.copy(target).addScaledVector(direction, distance)
    camera.lookAt(target)
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
}

const buildScene = async () => {
    THREE = await import('~/lib/three-desk')
    const gltf = await new THREE.GLTFLoader().loadAsync(MODEL_URL)
    if (disposed || !canvas.value) return

    scene = new THREE.Scene()
    room = new THREE.Group()
    scene.add(room)

    const nodes = {}
    gltf.scene.traverse((object) => {
        if (object.name) nodes[object.name] = object
        if (object.isMesh) {
            object.castShadow = true
            object.receiveShadow = true
        }
    })
    // Bureau centré sur l'origine
    const model = gltf.scene
    const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3())
    model.position.set(-center.x, 0, -center.z)
    room.add(model)

    items = Object.entries(ITEMS).map(([name, labelKey]) => ({
        name,
        labelKey,
        object: nodes[name],
        baseY: nodes[name].position.y,
        baseRotation: nodes[name].rotation.clone()
    }))

    // Dalle de l'écran : texture canvas non éclairée (l'écran « émet » sa propre lumière)
    screenCanvas = document.createElement('canvas')
    screenCanvas.width = 1024
    screenCanvas.height = 600
    screenTexture = new THREE.CanvasTexture(screenCanvas)
    screenTexture.colorSpace = THREE.SRGBColorSpace
    // UV au format glTF (origine en haut à gauche)
    screenTexture.flipY = false
    screenTexture.anisotropy = 4
    const display = nodes.screen_display
    display.material.dispose()
    display.material = new THREE.MeshBasicMaterial({ map: screenTexture })
    display.castShadow = false
    if (document.fonts) await document.fonts.ready
    if (disposed) return
    drawScreen()

    // Lampe : abat-jour émissif + lumière ponctuelle chaude sur le plateau
    nodes.lamp.traverse((object) => {
        if (object.isMesh) {
            [].concat(object.material).forEach((material) => {
                if (material.name.startsWith('lamp')) lampMaterial = material
            })
        }
    })
    lampLight = new THREE.PointLight(0xffd9a0, 0.35, 1.4, 2)
    lampLight.position.set(0, 0.2, 0)
    nodes.lamp.add(lampLight)
    applyLamp()

    // Sol invisible qui ne reçoit que les ombres (le fond de page reste visible)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: 0.14 }))
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    room.add(ground)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x2f4a4f, 1.6))
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
    keyLight.position.set(-1.5, 3, 2)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.left = -1.5
    keyLight.shadow.camera.right = 1.5
    keyLight.shadow.camera.top = 1.5
    keyLight.shadow.camera.bottom = -1.5
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 8
    keyLight.shadow.radius = 4
    keyLight.shadow.normalBias = 0.01
    scene.add(keyLight)

    camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50)
    raycaster = new THREE.Raycaster()

    renderer = new THREE.WebGLRenderer({
        canvas: canvas.value,
        antialias: true,
        alpha: true,
        powerPreference: 'low-power'
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true

    contextLostHandler = (event) => {
        event.preventDefault()
        ready.value = false
        stopLoop()
    }
    canvas.value.addEventListener('webglcontextlost', contextLostHandler)

    resizeObserver = new ResizeObserver(() => fitCamera())
    resizeObserver.observe(container.value)
    fitCamera()

    room.rotation.y = yaw
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
        // Repli silencieux : le contenu texte reste affiché
        console.warn('[DeskScene] WebGL scene unavailable', error)
        ready.value = false
    } finally {
        loading = false
    }
}

/* ------------------------------------------------------------------ */
/* Réactions des objets                                                */
/* ------------------------------------------------------------------ */

const applyLamp = () => {
    if (lampLight) lampLight.visible = lampOn.value
    if (lampMaterial) {
        lampMaterial.emissive.set(lampOn.value ? 0xf4d58a : 0x000000)
        lampMaterial.emissiveIntensity = lampOn.value ? 0.7 : 0
    }
}

const wiggle = (object, axis, amplitude) => {
    const base = object.rotation[axis]
    gsap.killTweensOf(object.rotation)
    if (reducedMotion) return
    gsap.timeline()
        .to(object.rotation, { [axis]: base + amplitude, duration: 0.1, ease: 'power1.out' })
        .to(object.rotation, { [axis]: base, duration: 0.8, ease: 'elastic.out(1.2, 0.25)' })
}

const press = (object) => {
    gsap.killTweensOf(object.scale)
    gsap.timeline()
        .to(object.scale, { y: 0.7, duration: 0.07, ease: 'power2.out' })
        .to(object.scale, { y: 1, duration: reducedMotion ? 0.1 : 0.4, ease: reducedMotion ? 'none' : 'elastic.out(1, 0.4)' })
}

const nextSlide = () => {
    slide = (slide + 1) % SLIDE_COUNT
    drawScreen()
}

const interact = (name) => {
    const item = items.find((candidate) => candidate.name === name)
    if (!item) return
    const object = item.object
    switch (name) {
        case 'screen':
            nextSlide()
            press(object)
            break
        case 'keyboard':
        case 'mouse':
            press(object)
            nextSlide()
            break
        case 'lamp':
            lampOn.value = !lampOn.value
            applyLamp()
            press(object)
            break
        case 'chair': {
            gsap.killTweensOf(object.rotation)
            const base = item.baseRotation.y
            object.rotation.y = base
            gsap.to(object.rotation, {
                y: base + Math.PI * 2,
                duration: reducedMotion ? 0.01 : 1.1,
                ease: 'power3.out',
                onComplete: () => { object.rotation.y = base }
            })
            break
        }
        case 'plant':
        case 'bigplant':
            wiggle(object, 'z', 0.18)
            break
        case 'books':
            wiggle(object, 'x', -0.2)
            break
    }
}

const setHovered = (item) => {
    if (hovered === item) return
    if (hovered) gsap.to(hovered.object.position, { y: hovered.baseY, duration: 0.25, ease: 'power2.out' })
    hovered = item
    if (item) gsap.to(item.object.position, { y: item.baseY + HOVER_LIFT, duration: 0.25, ease: 'power2.out' })
}

/* ------------------------------------------------------------------ */
/* Pointeur                                                            */
/* ------------------------------------------------------------------ */

const updatePointer = (event) => {
    const rect = container.value.getBoundingClientRect()
    pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    pointerLocal.x = event.clientX - rect.left
    pointerLocal.y = event.clientY - rect.top
    pointer.x = pointerNdc.x
    pointer.active = true
}

const pick = () => {
    raycaster.setFromCamera(pointerNdc, camera)
    const hits = raycaster.intersectObjects(items.map((item) => item.object), true)
    for (const hit of hits) {
        let object = hit.object
        while (object) {
            const item = items.find((candidate) => candidate.object === object)
            if (item) return item
            object = object.parent
        }
    }
    return null
}

const showLabel = (item) => {
    label.value = item ? t(`home.desk.items.${item.labelKey}`) : null
    labelPosition.value = { x: pointerLocal.x, y: pointerLocal.y }
}

const updateHover = () => {
    hoverDirty = false
    const item = pick()
    setHovered(item)
    showLabel(item)
    setCursor(item ? 'pointer' : '')
}

const onPointerDown = (event) => {
    if (!renderer) return
    updatePointer(event)
    const item = pick()
    if (!item) return
    interact(item.name)
    // Tactile : pas de survol, l'étiquette s'affiche brièvement au tap
    if (event.pointerType !== 'mouse') {
        setHovered(item)
        showLabel(item)
        clearTimeout(labelTimer)
        labelTimer = setTimeout(() => {
            setHovered(null)
            label.value = null
        }, 1800)
    }
}

const onPointerMove = (event) => {
    if (!renderer || event.pointerType !== 'mouse') return
    updatePointer(event)
    hoverDirty = true
}

const onPointerLeave = () => {
    pointer.x = 0
    pointer.active = false
    if (!renderer) return
    setHovered(null)
    setCursor('')
    label.value = null
}

/* ------------------------------------------------------------------ */
/* Boucle                                                              */
/* ------------------------------------------------------------------ */

const tick = (time) => {
    if (!isVisible || !isPageVisible || disposed) {
        rafId = null
        return
    }
    const idle = reducedMotion ? 0 : Math.sin(time * 0.0004) * 0.08
    const target = BASE_YAW + (pointer.active ? pointer.x * POINTER_YAW : idle)
    yaw += (target - yaw) * (reducedMotion ? 0.03 : 0.05)
    room.rotation.y = yaw

    if (hoverDirty) updateHover()
    renderer.render(scene, camera)
    rafId = requestAnimationFrame(tick)
}

const startLoop = () => {
    if (rafId === null && renderer && isVisible && isPageVisible) rafId = requestAnimationFrame(tick)
}

const stopLoop = () => {
    if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
    }
}

// Changement de langue : l'écran est redessiné dans la nouvelle langue
watch(locale, () => drawScreen())

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
        isVisible = entries[0].isIntersecting
        if (isVisible) {
            if (!renderer && !tapToLoad.value) load()
            else if (renderer) startLoop()
        }
    }, { rootMargin: '200px' })
    intersectionObserver.observe(container.value)

    // Tactile : chargement explicite au premier tap
    if (tapToLoad.value) {
        const loadOnTap = () => {
            container.value.removeEventListener('pointerdown', loadOnTap)
            if (!renderer) load()
        }
        listen(container.value, 'pointerdown', loadOnTap, { passive: true })
    }

    listen(container.value, 'pointerdown', onPointerDown)
    listen(container.value, 'pointermove', onPointerMove, { passive: true })
    listen(container.value, 'pointerleave', onPointerLeave)
    listen(document, 'visibilitychange', () => {
        isPageVisible = document.visibilityState === 'visible'
        if (isPageVisible) startLoop()
    })
})

onBeforeUnmount(() => {
    disposed = true
    stopLoop()
    clearTimeout(labelTimer)
    items.forEach(({ object }) => gsap.killTweensOf([object.position, object.rotation, object.scale]))
    if (intersectionObserver) intersectionObserver.disconnect()
    if (resizeObserver) resizeObserver.disconnect()
    listeners.forEach(({ target, type, fn, options }) => target.removeEventListener(type, fn, options))
    listeners.length = 0
    if (canvas.value && contextLostHandler) canvas.value.removeEventListener('webglcontextlost', contextLostHandler)
    if (scene) {
        scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose()
            if (object.material) [].concat(object.material).forEach((material) => material.dispose())
        })
    }
    if (screenTexture) screenTexture.dispose()
    if (renderer) {
        renderer.dispose()
        renderer.forceContextLoss()
    }
    renderer = scene = camera = room = raycaster = hovered = screenTexture = screenCanvas = lampLight = lampMaterial = null
    items = []
})
</script>

<style scoped>
.desk-scene {
    touch-action: pan-y;
}

.desk-label {
    background: var(--secondary-color);
    color: var(--bg-color);
    transform: translate(-50%, calc(-100% - 14px));
    white-space: nowrap;
}
</style>
