<template>
    <div ref="container" class="notfound-scene relative w-full h-full select-none">
        <canvas ref="canvas" v-show="ready" class="absolute inset-0 block w-full h-full" role="img"
            :aria-label="$t('notFound.scene.ariaLabel')"></canvas>

        <!-- État initial et repli (WebGL indisponible, chargement échoué, contexte perdu) -->
        <div v-show="!ready"
            class="flex flex-col justify-center items-center h-full font-semibold secondary-color">
            <span class="text-section" aria-hidden="true">404</span>
            <div class="text-sm mt-2 opacity-80">{{ tapToLoad ? $t('notFound.scene.tapToLoad') : $t('notFound.scene.loading') }}</div>
        </div>

        <div v-show="ready"
            class="absolute bottom-2 left-0 right-0 text-center text-xs sm:text-sm font-semibold secondary-color pointer-events-none">
            {{ $t('notFound.scene.hint') }}
        </div>

        <!-- Équivalents clavier / lecteur d'écran des clics sur la scène -->
        <template v-if="ready">
            <button v-for="key in actions" :key="key" type="button" class="sr-only" @click="interact(key)">
                {{ $t(`notFound.scene.actions.${key}`) }}
            </button>
        </template>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { prefersReducedMotion } from '~/composables/useRevealAnimations'

/**
 * Scène 3D de la page 404 : le bureau de la home, abandonné, et son corbeau (contenu : lib/notfound-desk.js,
 * qui expose { root, lights, view, targets, actions, update, interact, redraw, dispose }). Ce composant gère
 * le cycle de vie : chargement, caméra, boucle de rendu, pointeur, libération.
 *
 * Performance (même stratégie que DeskScene) : three (sous-ensemble lib/three-notfound.js), la scène et le .glb
 * (~90 Ko, déjà en cache si le visiteur vient de la home) sont chargés à la demande. La scène est le sujet de la
 * page : chargement direct, sauf en économie de données (au premier tap). La boucle ne tourne que si la scène
 * est visible et l'onglet actif ; tout est libéré au démontage.
 * prefers-reduced-motion : pas d'inclinaison idle (le reste est géré par lib/notfound-desk.js).
 */

const MAX_PIXEL_RATIO = 1.5
const POINTER_YAW = 0.35
const POINTER_PITCH = 0.08

const { t, locale } = useI18n()

const container = ref(null)
const canvas = ref(null)
const ready = ref(false)
const tapToLoad = ref(false)
const actions = ref([])

let THREE = null
let renderer = null
let scene = null
let camera = null
let stage = null
let content = null
let raycaster = null

const pointer = { x: 0, y: 0, active: false }
const pointerNdc = { x: 0, y: 0 }
let hoverDirty = false

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
/* Construction                                                        */
/* ------------------------------------------------------------------ */

const fitCamera = () => {
    if (!camera || !container.value) return
    const width = container.value.clientWidth || 1
    const height = container.value.clientHeight || 1
    camera.aspect = width / height
    const { target: [x, y, z], radius, direction: [dx, dy, dz] } = content.view
    const target = new THREE.Vector3(x, y, z)
    const direction = new THREE.Vector3(dx, dy, dz).normalize()
    const verticalFov = (camera.fov * Math.PI) / 180
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect)
    const distance = Math.max(radius / Math.sin(verticalFov / 2), radius / Math.sin(horizontalFov / 2))
    camera.position.copy(target).addScaledVector(direction, distance)
    camera.lookAt(target)
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
}

const buildScene = async () => {
    const [three, builder] = await Promise.all([import('~/lib/three-notfound'), import('~/lib/notfound-desk')])
    THREE = three
    if (document.fonts) await document.fonts.ready
    if (disposed || !canvas.value) return

    const created = await builder.createScene(THREE, {
        reducedMotion,
        font: getComputedStyle(container.value).fontFamily,
        t
    })
    if (disposed || !canvas.value) {
        created.dispose()
        return
    }
    content = created
    actions.value = content.actions

    scene = new THREE.Scene()
    stage = new THREE.Group()
    stage.rotation.y = content.view.yaw
    scene.add(stage)
    stage.add(content.root)
    content.lights.forEach((light) => scene.add(light))

    // Sol invisible qui ne reçoit que les ombres (le fond de page reste visible)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.14 }))
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    stage.add(ground)

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

    ready.value = true
    startLoop()
}

const load = async () => {
    if (loading || renderer || disposed) return
    if (!supportsWebGL()) return
    loading = true
    try {
        await buildScene()
    } catch (error) {
        // Repli silencieux : le « 404 » texte reste affiché
        console.warn('[NotFoundScene] WebGL scene unavailable', error)
        ready.value = false
    } finally {
        loading = false
    }
}

const interact = (name) => {
    if (content) content.interact(name)
}

/* ------------------------------------------------------------------ */
/* Pointeur                                                            */
/* ------------------------------------------------------------------ */

const updatePointer = (event) => {
    const rect = container.value.getBoundingClientRect()
    pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    pointer.x = pointerNdc.x
    pointer.y = pointerNdc.y
    pointer.active = true
}

// Cible touchée : on remonte du maillage touché jusqu'à l'objet déclaré (le corbeau, l'écran… sont des groupes)
const pick = () => {
    raycaster.setFromCamera(pointerNdc, camera)
    const targets = content.targets.filter((target) => target.object.visible)
    const hits = raycaster.intersectObjects(targets.map((target) => target.object), true)
    for (const hit of hits) {
        for (let object = hit.object; object; object = object.parent) {
            const target = targets.find((candidate) => candidate.object === object)
            if (target) return target
        }
    }
    return null
}

const onPointerDown = (event) => {
    if (!renderer) return
    updatePointer(event)
    const target = pick()
    if (target) interact(target.name)
}

const onPointerMove = (event) => {
    if (!renderer || event.pointerType !== 'mouse') return
    updatePointer(event)
    hoverDirty = true
}

const onPointerLeave = () => {
    pointer.active = false
    setCursor('')
}

/* ------------------------------------------------------------------ */
/* Boucle                                                              */
/* ------------------------------------------------------------------ */

const tick = (time) => {
    if (!isVisible || !isPageVisible || disposed) {
        rafId = null
        return
    }
    // La scène s'incline vers le curseur
    const idle = reducedMotion ? 0 : Math.sin(time * 0.0004) * 0.1
    const targetYaw = content.view.yaw + (pointer.active ? pointer.x * POINTER_YAW : idle)
    const targetPitch = pointer.active ? -pointer.y * POINTER_PITCH : 0
    const easing = reducedMotion ? 0.03 : 0.05
    stage.rotation.y += (targetYaw - stage.rotation.y) * easing
    stage.rotation.x += (targetPitch - stage.rotation.x) * easing

    content.update(time)
    if (hoverDirty) {
        hoverDirty = false
        setCursor(pick() ? 'pointer' : '')
    }
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

// Changement de langue : les textes dessinés dans la scène suivent
watch(locale, () => content?.redraw?.())

onMounted(() => {
    if (!import.meta.client || !container.value) return
    if (!('WebGLRenderingContext' in window)) return

    tapToLoad.value = !!(navigator.connection && navigator.connection.saveData)

    intersectionObserver = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting
        if (isVisible && renderer) startLoop()
    })
    intersectionObserver.observe(container.value)

    if (tapToLoad.value) {
        const loadOnTap = () => {
            container.value.removeEventListener('pointerdown', loadOnTap)
            load()
        }
        listen(container.value, 'pointerdown', loadOnTap, { passive: true })
    } else {
        load()
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
    if (content) content.dispose()
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
    if (renderer) {
        renderer.dispose()
        renderer.forceContextLoss()
    }
    renderer = scene = camera = stage = content = raycaster = null
})
</script>

<style scoped>
.notfound-scene {
    touch-action: pan-y;
}
</style>
