<template>
    <div ref="container" class="toolbox-scene relative w-full h-full select-none">
        <!-- Scène WebGL (chargée à l'approche du viewport) -->
        <canvas ref="canvas" v-show="ready" class="absolute inset-0 block w-full h-full" role="img"
            :aria-label="$t('about.toolbox.ariaLabel', { tools: tools.join(', ') })"></canvas>

        <!-- État initial et repli (WebGL indisponible, chargement échoué, contexte perdu) -->
        <div v-show="!ready"
            class="flex flex-col justify-center items-center h-full text-lg sm:text-xl md:text-2xl font-semibold secondary-color">
            <span>{{ $t('about.toolbox.title') }}</span>
            <div class="text-sm mt-2 opacity-80">{{ tapToLoad ? $t('about.toolbox.tapToLoad') : $t('about.toolbox.loading') }}</div>
        </div>

        <div v-show="ready"
            class="absolute bottom-2 left-0 right-0 text-center text-xs sm:text-sm font-semibold secondary-color pointer-events-none">
            {{ isOpen ? $t('about.toolbox.hintOpen') : $t('about.toolbox.hintClosed') }}
        </div>

        <!-- Nom de l'outil sous le pointeur (survol ou glisser) -->
        <div v-if="label" class="toolbox-label absolute pointer-events-none px-2 py-1 rounded text-xs sm:text-sm font-semibold"
            :style="{ left: `${labelPosition.x}px`, top: `${labelPosition.y}px` }" aria-hidden="true">
            {{ label }}
        </div>

        <!-- Équivalent clavier / lecteur d'écran du clic sur la boîte -->
        <button v-if="ready" type="button" class="sr-only" @click="toggle">
            {{ isOpen ? $t('about.toolbox.close') : $t('about.toolbox.open') }}
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '~/composables/useRevealAnimations'

/**
 * Boîte à outils 3D (public/models/toolbox.glb : « Metal Toolbox » de Mateusz Sadek, Poly Haven, CC0,
 * recolorée aux couleurs du site avec un médaillon ERIEU) : fermée, elle sautille de temps en temps ;
 * au clic, le couvercle s'ouvre et les jetons de la stack sautent dehors. Les jetons se déplacent à la
 * souris / au doigt (physique maison : gravité, rebonds, empilement, collisions entre jetons et avec la boîte).
 * Un jeton lâché au-dessus de la boîte ouverte y retourne ; un clic sur la boîte range tout et la referme.
 *
 * Performance (même stratégie que DeskScene) : three (sous-ensemble lib/three-toolbox.js) et le .glb sont
 * chargés à la demande — à l'approche du viewport sur pointeur fin, au premier tap sur tactile / économie de
 * données. La boucle de rendu ne tourne que si la scène est visible et l'onglet actif ; tout est libéré au démontage.
 * prefers-reduced-motion : pas de sautillement, ouverture et rangement sans trajectoires balistiques.
 */

const props = defineProps({
    // Noms des outils, dans l'ordre de TOKEN_NAMES (libellé accessible et étiquette au survol)
    tools: { type: Array, default: () => [] }
})

const container = ref(null)
const canvas = ref(null)
const ready = ref(false)
const tapToLoad = ref(false)
const isOpen = ref(false)
const label = ref(null)
const labelPosition = ref({ x: 0, y: 0 })

const MODEL_URL = '/models/toolbox.glb'
// Jetons du modèle (nœuds tok_*), dans l'ordre de la liste « Boîte à outils » de la page À propos
const TOKEN_NAMES = [
    'nuxt', 'vue', 'react', 'gsap', 'three', 'tailwind',
    'node', 'nitro', 'postgres', 'rest',
    'figma', 'designsystem',
    'git', 'github', 'vercel', 'lighthouse', 'claude'
]
const MAX_PIXEL_RATIO = 1.5

// Dimensions issues du modèle Blender (unités three, Y vers le haut)
const GRAVITY = -18
const TOKEN_HALF = 0.065
const TOKEN_RADIUS = 0.36
const BOX_HALF_X = 1.42
const BOX_HALF_Z = 0.8
const BOX_HEIGHT = 0.86
const TRAY_FLOOR = 0.716
const BOUNDS = { x: 7, zMin: -1.6, zMax: 4 }
// Marge de cadre (coordonnées écran normalisées) que les jetons ne franchissent pas
const VIEW_MARGIN_X = 0.84
const VIEW_MARGIN_BOTTOM = -0.7
const VIEW_MARGIN_TOP = 0.8
const DRAG_HEIGHT = 0.7
const LID_OPEN = -1.95
const TWO_PI = Math.PI * 2

let THREE = null
let renderer = null
let scene = null
let camera = null
let boxGroup = null
let lid = null
let raycaster = null
let dragPlane = null
let tokens = []
let projected = null
let pmremGenerator = null
let environmentTexture = null

// 'closed' | 'opening' | 'open' | 'closing'
let mode = 'closed'
let dragged = null
let dragPointerId = null
const dragTarget = { x: 0, z: 0 }
const pointerNdc = { x: 0, y: 0 }
const pointerLocal = { x: 0, y: 0 }
let hoverDirty = false

let rafId = null
let lastTime = null
let isVisible = false
let isPageVisible = true
let loading = false
let disposed = false
let intersectionObserver = null
let resizeObserver = null
let contextLostHandler = null
let hopCall = null
const timelines = new Set()
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

const track = (timeline) => {
    timelines.add(timeline)
    timeline.eventCallback('onInterrupt', () => timelines.delete(timeline))
    return timeline
}

// Emplacement d'un jeton rangé : huit piles basses (deux rangées de quatre) dans le plateau, sous la tige et
// sous les pentes du couvercle (repère de boxGroup)
const slotPosition = (index) => {
    const pile = index % 8
    return new THREE.Vector3(
        [-0.9, -0.3, 0.3, 0.9][pile % 4],
        TRAY_FLOOR + TOKEN_HALF + Math.floor(index / 8) * TOKEN_HALF * 2,
        pile < 4 ? -0.3 : 0.3
    )
}

const tokenLabel = (token) => props.tools[token.index] || TOKEN_NAMES[token.index]

// Angle multiple de 2π le plus proche : le jeton se pose toujours face gravée vers le haut
const nearestTurn = (angle) => Math.round(angle / TWO_PI) * TWO_PI

// Points d'atterrissage tirés au hasard dans la zone visible, autour et devant la boîte, sans chevauchement
// (s'il n'y a pas assez de place, les derniers jetons retombent sur les autres et s'empilent)
const landingSpots = (count) => {
    const spots = []
    for (let attempt = 0; spots.length < count && attempt < 800; attempt++) {
        const x = (Math.random() * 2 - 1) * BOUNDS.x
        const z = BOUNDS.zMin + Math.random() * (BOUNDS.zMax - BOUNDS.zMin)
        // Ni sur la boîte ni masqué derrière elle
        if (z < BOX_HALF_Z + TOKEN_RADIUS && Math.abs(x) < BOX_HALF_X + TOKEN_RADIUS * 1.5) continue
        projected.set(x, TOKEN_HALF, z).project(camera)
        if (Math.abs(projected.x) > VIEW_MARGIN_X - 0.06) continue
        if (projected.y < VIEW_MARGIN_BOTTOM + 0.1 || projected.y > VIEW_MARGIN_TOP - 0.2) continue
        if (spots.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < TOKEN_RADIUS * 2.4)) continue
        spots.push([x, z])
    }
    for (let i = 0; spots.length < count; i++) spots.push(spots[i] || [0, BOX_HALF_Z + 1])
    return spots
}

const setTouchAction = () => {
    // Fermée : le défilement vertical de la page reste possible ; ouverte : le doigt déplace les jetons
    if (container.value) container.value.style.touchAction = mode === 'closed' ? 'pan-y' : 'none'
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
    const target = new THREE.Vector3(0, 0.6, 0.75)
    const direction = new THREE.Vector3(0, 0.6, 1).normalize()
    const verticalFov = (camera.fov * Math.PI) / 180
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect)
    // Cadre : la boîte et la zone où retombent les jetons
    const distance = Math.max(1.9 / Math.tan(verticalFov / 2), 3.7 / Math.tan(horizontalFov / 2))
    camera.position.copy(target).addScaledVector(direction, distance)
    camera.lookAt(target)
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
}

const buildScene = async () => {
    THREE = await import('~/lib/three-toolbox')
    const gltf = await new THREE.GLTFLoader().loadAsync(MODEL_URL)
    if (disposed || !canvas.value) return

    scene = new THREE.Scene()
    boxGroup = new THREE.Group()
    scene.add(boxGroup)

    const nodes = {}
    gltf.scene.traverse((object) => {
        if (object.name) nodes[object.name] = object
        if (object.isMesh) object.castShadow = true
    })
    ;['box_body', 'box_lid', 'box_tray'].forEach((name) => boxGroup.add(nodes[name]))
    lid = nodes.box_lid

    tokens = TOKEN_NAMES.map((name, index) => {
        const object = nodes[`tok_${name}`]
        boxGroup.add(object)
        object.position.copy(slotPosition(index))
        object.rotation.set(0, (Math.random() - 0.5) * 0.6, 0)
        return {
            index,
            object,
            velocity: new THREE.Vector3(),
            spin: new THREE.Vector3(),
            state: 'inside', // 'inside' | 'free' | 'drag' | 'returning'
            escaping: false,
            // Orientation de repos : logo à peu près droit face à la caméra, légèrement de travers
            restYaw: 0
        }
    })

    // Sol invisible qui ne reçoit que les ombres (le fond de page reste visible)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.16 }))
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x2f4a4f, 0.8))
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
    keyLight.position.set(-4, 9, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.left = -6
    keyLight.shadow.camera.right = 6
    keyLight.shadow.camera.top = 6
    keyLight.shadow.camera.bottom = -6
    keyLight.shadow.camera.near = 1
    keyLight.shadow.camera.far = 25
    keyLight.shadow.radius = 5
    keyLight.shadow.normalBias = 0.02
    scene.add(keyLight)

    camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    raycaster = new THREE.Raycaster()
    projected = new THREE.Vector3()
    dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -DRAG_HEIGHT)

    renderer = new THREE.WebGLRenderer({
        canvas: canvas.value,
        antialias: true,
        alpha: true,
        powerPreference: 'low-power'
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true

    // Environnement d'atelier généré (pas de HDR à télécharger) : indispensable aux pièces métalliques
    pmremGenerator = new THREE.PMREMGenerator(renderer)
    const room = new THREE.RoomEnvironment()
    environmentTexture = pmremGenerator.fromScene(room, 0.04).texture
    room.dispose()
    scene.environment = environmentTexture
    scene.environmentIntensity = 0.6

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
    setTouchAction()
    startLoop()
    scheduleHop()
}

const load = async () => {
    if (loading || renderer || disposed) return
    if (!supportsWebGL()) return
    loading = true
    try {
        await buildScene()
    } catch (error) {
        // Repli silencieux : le contenu texte reste affiché
        console.warn('[ToolboxScene] WebGL scene unavailable', error)
        ready.value = false
    } finally {
        loading = false
    }
}

/* ------------------------------------------------------------------ */
/* Animations de la boîte                                              */
/* ------------------------------------------------------------------ */

const resetBoxTransform = () => {
    gsap.killTweensOf([boxGroup.position, boxGroup.rotation, boxGroup.scale])
    boxGroup.position.set(0, 0, 0)
    boxGroup.rotation.set(0, 0, 0)
    boxGroup.scale.set(1, 1, 1)
}

const hop = () => {
    const tilt = (Math.random() < 0.5 ? -1 : 1) * 0.07
    const height = 0.35 + Math.random() * 0.2
    track(gsap.timeline({ onComplete() { timelines.delete(this) } }))
        .to(boxGroup.scale, { x: 1.06, y: 0.88, z: 1.06, duration: 0.14, ease: 'power2.out' })
        .to(boxGroup.scale, { x: 0.96, y: 1.08, z: 0.96, duration: 0.12, ease: 'power2.in' })
        .to(boxGroup.position, { y: height, duration: 0.24, ease: 'power2.out' })
        .to(boxGroup.rotation, { z: tilt, duration: 0.24, ease: 'power1.out' }, '<')
        .to(lid.rotation, { x: -0.16, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.out' }, '<')
        .to(boxGroup.position, { y: 0, duration: 0.2, ease: 'power2.in' })
        .to(boxGroup.rotation, { z: 0, duration: 0.2, ease: 'power1.in' }, '<')
        .to(boxGroup.scale, { x: 1, y: 1, z: 1, duration: 0.2 }, '<')
        .to(boxGroup.scale, { x: 1.05, y: 0.92, z: 1.05, duration: 0.08, ease: 'power2.out' })
        .to(boxGroup.scale, { x: 1, y: 1, z: 1, duration: 0.45, ease: 'elastic.out(1, 0.4)' })
}

const scheduleHop = () => {
    if (reducedMotion) return
    if (hopCall) hopCall.kill()
    hopCall = gsap.delayedCall(2.2 + Math.random() * 2.6, () => {
        if (mode === 'closed' && isVisible && isPageVisible) hop()
        scheduleHop()
    })
}

const launch = (token, [x, z]) => {
    scene.attach(token.object)
    const position = token.object.position
    if (reducedMotion) {
        token.state = 'returning'
        track(gsap.timeline({ onComplete() { token.state = 'free'; timelines.delete(this) } }))
            .to(position, { x, z, y: TOKEN_HALF, duration: 0.4, ease: 'power2.out' })
            .to(token.object.rotation, { x: 0, z: 0, duration: 0.4 }, 0)
        return
    }
    // Trajectoire balistique qui retombe sur l'emplacement visé ; la physique gère ensuite rebonds et glissade
    const flight = 0.6 + Math.hypot(x - position.x, z - position.z) * 0.05 + Math.random() * 0.12
    token.velocity.set(
        (x - position.x) / flight,
        (TOKEN_HALF - position.y - 0.5 * GRAVITY * flight * flight) / flight,
        (z - position.z) / flight
    )
    const flip = Math.random() < 0.5 ? -1 : 1
    token.spin.set(flip * (6 + Math.random() * 5), (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6)
    token.escaping = true
    token.restYaw = (Math.random() - 0.5) * 0.7
    token.state = 'free'
}

const open = () => {
    if (mode !== 'closed') return
    mode = 'opening'
    isOpen.value = true
    setTouchAction()
    resetBoxTransform()
    gsap.killTweensOf(lid.rotation)

    const spots = landingSpots(tokens.length)
    const timeline = track(gsap.timeline({
        onComplete() {
            mode = 'open'
            timelines.delete(this)
        }
    }))
    if (!reducedMotion) {
        timeline
            .to(boxGroup.scale, { x: 1.06, y: 0.88, z: 1.06, duration: 0.15, ease: 'power2.out' })
            .to(boxGroup.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'elastic.out(1, 0.35)' })
    }
    timeline.to(lid.rotation, { x: LID_OPEN, duration: reducedMotion ? 0.3 : 0.6, ease: reducedMotion ? 'power2.out' : 'back.out(1.7)' }, reducedMotion ? 0 : 0.15)
    tokens.forEach((token, index) => {
        timeline.call(() => launch(token, spots[index]), null, (reducedMotion ? 0.1 : 0.28) + index * 0.06)
    })
}

const closeLid = () => {
    mode = 'closing'
    track(gsap.timeline({
        onComplete() {
            mode = 'closed'
            isOpen.value = false
            setTouchAction()
            timelines.delete(this)
            scheduleHop()
        }
    }))
        .to(lid.rotation, { x: 0, duration: reducedMotion ? 0.3 : 0.45, ease: reducedMotion ? 'power2.in' : 'bounce.out' })
        .to(boxGroup.scale, { x: 1.04, y: 0.94, z: 1.04, duration: 0.08, ease: 'power2.out' }, reducedMotion ? 0.3 : 0.2)
        .to(boxGroup.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' })
}

const tokenArrivedHome = () => {
    if (mode === 'open' && tokens.every((token) => token.state === 'inside')) closeLid()
}

// Ramène un jeton dans son emplacement (arc au-dessus de la boîte)
const sendHome = (token, delay = 0) => {
    token.state = 'returning'
    if (label.value === tokenLabel(token)) label.value = null
    token.velocity.set(0, 0, 0)
    token.spin.set(0, 0, 0)
    boxGroup.attach(token.object)
    const position = token.object.position
    const rotation = token.object.rotation
    const slot = slotPosition(token.index)
    const peak = Math.max(position.y, BOX_HEIGHT) + (reducedMotion ? 0.4 : 1.2)
    track(gsap.timeline({
        delay,
        onComplete() {
            token.state = 'inside'
            timelines.delete(this)
            tokenArrivedHome()
        }
    }))
        .to(position, { x: slot.x, z: slot.z, duration: 0.6, ease: 'power1.inOut' }, 0)
        .to(position, { y: peak, duration: 0.3, ease: 'power2.out' }, 0)
        .to(position, { y: slot.y, duration: 0.3, ease: 'power2.in' }, 0.3)
        .to(rotation, { x: nearestTurn(rotation.x), z: nearestTurn(rotation.z), duration: 0.6, ease: 'power1.inOut' }, 0)
}

const close = () => {
    if (mode !== 'open') return
    if (dragged) release()
    const outside = tokens.filter((token) => token.state === 'free')
    if (!outside.length && tokens.every((token) => token.state === 'inside')) {
        closeLid()
        return
    }
    outside.forEach((token, index) => sendHome(token, index * 0.07))
}

const toggle = () => {
    if (mode === 'closed') open()
    else if (mode === 'open') close()
}

/* ------------------------------------------------------------------ */
/* Physique des jetons                                                 */
/* ------------------------------------------------------------------ */

const isOverBox = (position, margin = 0) =>
    Math.abs(position.x) < BOX_HALF_X + margin && Math.abs(position.z) < BOX_HALF_Z + margin

const stepToken = (token, dt) => {
    const position = token.object.position
    const rotation = token.object.rotation
    const velocity = token.velocity

    velocity.y += GRAVITY * dt
    position.addScaledVector(velocity, dt)

    // Sol : le plancher ou le dessus d'un jeton situé juste en dessous (empilement)
    let floor = TOKEN_HALF
    for (const other of tokens) {
        if (other === token || other.state !== 'free') continue
        const otherPosition = other.object.position
        if (otherPosition.y >= position.y) continue
        const dx = otherPosition.x - position.x
        const dz = otherPosition.z - position.z
        if (dx * dx + dz * dz < (TOKEN_RADIUS * 1.1) ** 2) floor = Math.max(floor, otherPosition.y + TOKEN_HALF * 2)
    }

    let grounded = false
    if (position.y <= floor) {
        position.y = floor
        if (velocity.y < -1.5) {
            velocity.y = -velocity.y * 0.32
            token.spin.multiplyScalar(0.5)
        } else {
            velocity.y = 0
            grounded = true
        }
    }

    if (grounded) {
        const friction = Math.exp(-5 * dt)
        velocity.x *= friction
        velocity.z *= friction
        const settle = 1 - Math.exp(-12 * dt)
        rotation.x += (nearestTurn(rotation.x) - rotation.x) * settle
        rotation.z += (nearestTurn(rotation.z) - rotation.z) * settle
        token.spin.set(0, 0, 0)
        rotation.y += (nearestTurn(rotation.y - token.restYaw) + token.restYaw - rotation.y) * settle
        token.escaping = false
    } else {
        rotation.x += token.spin.x * dt
        rotation.y += token.spin.y * dt
        rotation.z += token.spin.z * dt
    }

    // Limites du cadre
    if (position.x < -BOUNDS.x || position.x > BOUNDS.x) {
        position.x = Math.sign(position.x) * BOUNDS.x
        velocity.x *= -0.5
    }
    if (position.z < BOUNDS.zMin || position.z > BOUNDS.zMax) {
        position.z = Math.min(BOUNDS.zMax, Math.max(BOUNDS.zMin, position.z))
        velocity.z *= -0.5
    }

    keepInView(position, velocity)

    // Parois de la boîte (ignorées pendant la sortie)
    if (token.escaping && (position.y > BOX_HEIGHT + 0.3 || !isOverBox(position, TOKEN_RADIUS))) token.escaping = false
    if (!token.escaping && position.y < BOX_HEIGHT + TOKEN_HALF && isOverBox(position, TOKEN_RADIUS * 0.9)) {
        const extentX = BOX_HALF_X + TOKEN_RADIUS * 0.9
        const extentZ = BOX_HALF_Z + TOKEN_RADIUS * 0.9
        const sideX = Math.sign(position.x) || 1
        const sideZ = Math.sign(position.z) || 1
        if (extentX - Math.abs(position.x) < extentZ - Math.abs(position.z)) {
            position.x = sideX * extentX
            velocity.x = sideX * Math.abs(velocity.x) * 0.4
        } else {
            position.z = sideZ * extentZ
            velocity.z = sideZ * Math.abs(velocity.z) * 0.4
        }
    }
}

// Garde le jeton dans le cadre visible (la largeur visible dépend de la profondeur à cause de la perspective)
const keepInView = (position, velocity) => {
    projected.copy(position).project(camera)
    if (Math.abs(projected.x) > VIEW_MARGIN_X) {
        const side = Math.sign(projected.x)
        position.x -= side * 0.04
        if (velocity.x * side > 0) velocity.x *= -0.5
    }
    if (projected.y < VIEW_MARGIN_BOTTOM) {
        position.z -= 0.04
        if (velocity.z > 0) velocity.z *= -0.5
    } else if (projected.y > VIEW_MARGIN_TOP) {
        position.z += 0.04
        if (velocity.z < 0) velocity.z *= -0.5
    }
}

// Collisions entre jetons au même niveau (disques dans le plan horizontal)
const separateTokens = () => {
    const minDistance = TOKEN_RADIUS * 2 * 0.95
    for (let i = 0; i < tokens.length; i++) {
        const a = tokens[i]
        if (a.state !== 'free' && a.state !== 'drag') continue
        for (let j = i + 1; j < tokens.length; j++) {
            const b = tokens[j]
            if (b.state !== 'free' && b.state !== 'drag') continue
            const pa = a.object.position
            const pb = b.object.position
            if (Math.abs(pa.y - pb.y) > TOKEN_HALF * 1.8) continue
            let dx = pb.x - pa.x
            let dz = pb.z - pa.z
            const distance = Math.hypot(dx, dz)
            if (distance >= minDistance) continue
            if (distance < 1e-4) {
                dx = 1
                dz = 0
            } else {
                dx /= distance
                dz /= distance
            }
            const overlap = minDistance - distance
            const shareA = a.state === 'drag' ? 0 : b.state === 'drag' ? 1 : 0.5
            const shareB = 1 - shareA
            pa.x -= dx * overlap * shareA
            pa.z -= dz * overlap * shareA
            pb.x += dx * overlap * shareB
            pb.z += dz * overlap * shareB
            // Échange d'impulsion le long de la normale (restitution 0.4)
            const relative = (b.velocity.x - a.velocity.x) * dx + (b.velocity.z - a.velocity.z) * dz
            if (relative < 0) {
                const impulse = -relative * 0.7
                if (shareA) {
                    a.velocity.x -= dx * impulse
                    a.velocity.z -= dz * impulse
                }
                if (shareB) {
                    b.velocity.x += dx * impulse
                    b.velocity.z += dz * impulse
                }
            }
        }
    }
}

const stepDrag = (token, dt) => {
    const position = token.object.position
    const rotation = token.object.rotation
    const previousX = position.x
    const previousY = position.y
    const previousZ = position.z
    const follow = 1 - Math.exp(-18 * dt)
    position.x += (dragTarget.x - position.x) * follow
    position.y += (DRAG_HEIGHT - position.y) * follow
    position.z += (dragTarget.z - position.z) * follow
    token.velocity.set((position.x - previousX) / dt, (position.y - previousY) / dt, (position.z - previousZ) / dt)
    // Légère inclinaison dans le sens du mouvement
    const tilt = 1 - Math.exp(-10 * dt)
    const targetX = nearestTurn(rotation.x) + Math.max(-0.5, Math.min(0.5, token.velocity.z * 0.05))
    const targetZ = nearestTurn(rotation.z) + Math.max(-0.5, Math.min(0.5, -token.velocity.x * 0.05))
    rotation.x += (targetX - rotation.x) * tilt
    rotation.z += (targetZ - rotation.z) * tilt
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
}

const showLabel = (token) => {
    label.value = token ? tokenLabel(token) : null
    labelPosition.value = { x: pointerLocal.x, y: pointerLocal.y }
}

// Objet sous le pointeur : { token } ou { box: true } ou null
const pick = () => {
    raycaster.setFromCamera(pointerNdc, camera)
    const hits = raycaster.intersectObjects([boxGroup, ...tokens.map((token) => token.object)], true)
    for (const hit of hits) {
        let object = hit.object
        while (object) {
            const token = tokens.find((candidate) => candidate.object === object)
            if (token) return { token }
            if (object === boxGroup) return { box: true }
            object = object.parent
        }
    }
    return null
}

const updateDragTarget = () => {
    raycaster.setFromCamera(pointerNdc, camera)
    const point = new THREE.Vector3()
    if (!raycaster.ray.intersectPlane(dragPlane, point)) return
    dragTarget.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, point.x))
    dragTarget.z = Math.max(BOUNDS.zMin, Math.min(BOUNDS.zMax, point.z))
}

const release = () => {
    const token = dragged
    dragged = null
    label.value = null
    if (container.value && dragPointerId !== null && container.value.hasPointerCapture(dragPointerId)) {
        container.value.releasePointerCapture(dragPointerId)
    }
    dragPointerId = null
    if (!token) return
    // Lâché au-dessus de la boîte ouverte : le jeton est rangé
    if (mode === 'open' && isOverBox(token.object.position)) {
        sendHome(token)
        return
    }
    token.state = 'free'
    token.velocity.clampLength(0, 9)
    token.spin.set(token.velocity.z * 0.8, (Math.random() - 0.5) * 3, -token.velocity.x * 0.8)
}

const onPointerDown = (event) => {
    if (!renderer) return
    updatePointer(event)
    const hit = pick()
    if (!hit) return
    if (hit.token && hit.token.state === 'free') {
        dragged = hit.token
        dragged.state = 'drag'
        dragPointerId = event.pointerId
        try {
            container.value.setPointerCapture(event.pointerId)
        } catch {
            // Pointeur déjà relâché : le glisser continue sans capture
        }
        updateDragTarget()
        showLabel(dragged)
        setCursor('grabbing')
        event.preventDefault()
    } else if (hit.box || hit.token.state === 'inside') {
        toggle()
    }
}

const onPointerMove = (event) => {
    if (!renderer) return
    updatePointer(event)
    if (dragged) {
        updateDragTarget()
        showLabel(dragged)
    } else hoverDirty = true
}

const onPointerUp = () => {
    if (dragged) {
        release()
        hoverDirty = true
    }
}

const updateHover = () => {
    hoverDirty = false
    const hit = pick()
    showLabel(hit && hit.token && hit.token.state === 'free' ? hit.token : null)
    if (hit && hit.token && hit.token.state === 'free') setCursor('grab')
    else if (hit && hit.box && (mode === 'closed' || mode === 'open')) setCursor('pointer')
    else setCursor('')
}

/* ------------------------------------------------------------------ */
/* Boucle                                                              */
/* ------------------------------------------------------------------ */

const tick = (time) => {
    if (!isVisible || !isPageVisible || disposed) {
        rafId = null
        lastTime = null
        return
    }
    const dt = lastTime === null ? 1 / 60 : Math.min((time - lastTime) / 1000, 1 / 30)
    lastTime = time

    for (const token of tokens) {
        if (token.state === 'free') stepToken(token, dt)
        else if (token.state === 'drag') stepDrag(token, dt)
    }
    separateTokens()
    if (hoverDirty && !dragged) updateHover()

    renderer.render(scene, camera)
    rafId = requestAnimationFrame(tick)
}

const startLoop = () => {
    if (rafId === null && renderer && isVisible && isPageVisible) {
        lastTime = null
        rafId = requestAnimationFrame(tick)
    }
}

const stopLoop = () => {
    if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
    }
}

onMounted(() => {
    if (!import.meta.client || !container.value) return
    if (!('WebGLRenderingContext' in window)) return

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const saveData = !!(navigator.connection && navigator.connection.saveData)
    tapToLoad.value = !finePointer || saveData

    intersectionObserver = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting
        if (isVisible) {
            if (!renderer && !tapToLoad.value) load()
            else if (renderer) startLoop()
        }
    }, { rootMargin: '200px' })
    intersectionObserver.observe(container.value)

    if (tapToLoad.value) {
        const loadOnTap = () => {
            container.value.removeEventListener('pointerdown', loadOnTap)
            if (!renderer) load()
        }
        listen(container.value, 'pointerdown', loadOnTap, { passive: true })
    }

    listen(container.value, 'pointerdown', onPointerDown)
    listen(container.value, 'pointermove', onPointerMove, { passive: true })
    listen(container.value, 'pointerup', onPointerUp)
    listen(container.value, 'pointercancel', onPointerUp)
    listen(container.value, 'pointerleave', () => {
        if (dragged) return
        setCursor('')
        label.value = null
    })
    listen(document, 'visibilitychange', () => {
        isPageVisible = document.visibilityState === 'visible'
        if (isPageVisible) startLoop()
    })
})

onBeforeUnmount(() => {
    disposed = true
    stopLoop()
    if (hopCall) hopCall.kill()
    timelines.forEach((timeline) => timeline.kill())
    timelines.clear()
    if (boxGroup) gsap.killTweensOf([boxGroup.position, boxGroup.rotation, boxGroup.scale])
    if (lid) gsap.killTweensOf(lid.rotation)
    tokens.forEach((token) => gsap.killTweensOf([token.object.position, token.object.rotation]))
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
    if (environmentTexture) environmentTexture.dispose()
    if (pmremGenerator) pmremGenerator.dispose()
    if (renderer) {
        renderer.dispose()
        renderer.forceContextLoss()
    }
    renderer = scene = camera = boxGroup = lid = raycaster = dragPlane = projected = pmremGenerator = environmentTexture = null
    tokens = []
})
</script>

<style scoped>
.toolbox-scene {
    touch-action: pan-y;
}

.toolbox-label {
    background: var(--secondary-color);
    color: var(--bg-color);
    transform: translate(-50%, calc(-100% - 14px));
    white-space: nowrap;
}
</style>
