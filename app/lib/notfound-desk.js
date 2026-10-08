import { gsap } from 'gsap'

/**
 * Scène de la page 404 — « le bureau abandonné ».
 * Le mini bureau de la home (public/models/desk.glb), laissé à l'abandon : tout est modifié ici, le modèle reste
 * partagé. Chaise renversée, plantes fanées, livres tombés, couleurs ternies par la poussière, toiles d'araignée,
 * feuilles au sol, poussière en suspension. Ce qui vit encore : la lampe qui grésille, l'écran en veille qui
 * glitche (« 404 », dernière connexion), un post-it… et un corbeau (low-poly, construit ici) qui vient se poser
 * sur l'écran, regarde autour de lui puis repart.
 * Au clic : l'écran glitche, la lampe grésille, le corbeau s'envole, la chaise et les plantes frémissent.
 * prefers-reduced-motion : le corbeau reste posé (il tourne la tête au clic), ni poussière qui dérive,
 * ni glitch ou grésillement automatiques.
 */

const MODEL_URL = '/models/desk.glb'
const COLORS = {
    screenBg: '#0B1214',
    screenText: '#2F4A4F',
    screenMuted: '#5E7377',
    accent: '#9FD3B5',
    key: '#F4E4B8',
    crow: '#1A1F21',
    beak: '#2B3133',
    eye: '#EEEEEE',
    paper: '#ECE8DC',
    dust: '#A9A497',
    dried: '#7A6743',
    driedDark: '#5C4B30',
    web: '#6F7A7C'
}
// Orientation de repos du bureau (vue de trois quarts, comme sur la home)
const BASE_YAW = 0.3
const CROW_SCALE = 0.034
// Le corbeau posé regarde vers la caméra, de trois quarts
const PERCH_YAW = -Math.PI / 2 + 0.7
// Hors-champ par défaut (canvas limité au bureau) ; sinon calculé depuis les bords réels de l'écran, cf. setFlightBounds
const OFFSCREEN_X = 3
// Marge au-delà du bord : le corbeau (ailes déployées) doit être entièrement sorti
const OFFSCREEN_MARGIN = 0.35
// Longueur d'un vol avec le hors-champ par défaut : au-delà, le vol s'allonge (en racine, pour garder du rythme)
const BASE_FLIGHT_LENGTH = 3.5

const rand = (min, max) => min + Math.random() * (max - min)

/* ------------------------------------------------------------------ */
/* Corbeau                                                             */
/* ------------------------------------------------------------------ */

// Aile : quadrilatère plat (épaule avant/arrière, pointe, bord d'attaque), envergure vers +z (gauche) ou -z (droite)
const wingGeometry = (THREE, side) => {
    const geometry = new THREE.BufferGeometry()
    const points = [[0.7, 0, 0], [-0.7, 0, 0], [-1.4, 0, 2.2], [0.2, 0, 1.5]]
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flatMap(([x, y, z]) => [x, y, z * side]), 3))
    geometry.setIndex([0, 1, 3, 1, 2, 3])
    geometry.computeVertexNormals()
    return geometry
}

// Corbeau face à +x, pieds à l'origine (unités locales, mis à l'échelle CROW_SCALE)
const buildCrow = (THREE) => {
    const material = new THREE.MeshStandardMaterial({ color: COLORS.crow, roughness: 0.55, flatShading: true, side: THREE.DoubleSide })
    const crow = new THREE.Group()
    crow.rotation.order = 'YZX'
    crow.scale.setScalar(CROW_SCALE)

    const body = new THREE.Group()
    body.position.y = 1.15
    crow.add(body)

    const torso = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), material)
    torso.scale.set(1.5, 0.85, 0.85)
    body.add(torso)

    const head = new THREE.Group()
    head.position.set(1.25, 0.6, 0)
    body.add(head)
    head.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), material))
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.75, 4), new THREE.MeshStandardMaterial({ color: COLORS.beak, flatShading: true }))
    beak.rotation.z = -Math.PI / 2
    beak.position.set(0.85, -0.1, 0)
    head.add(beak)
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: COLORS.eye })
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), eyeMaterial)
        eye.position.set(0.3, 0.15, side * 0.45)
        head.add(eye)
    }

    // Queue en éventail : cône aplati, large à l'arrière
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, 3), material)
    tail.rotation.z = -Math.PI / 2
    tail.scale.set(0.25, 1, 1)
    tail.position.set(-1.9, 0.15, 0)
    body.add(tail)

    const wings = [1, -1].map((side) => {
        const pivot = new THREE.Group()
        pivot.position.set(0.1, 0.45, side * 0.55)
        pivot.add(new THREE.Mesh(wingGeometry(THREE, side), material))
        body.add(pivot)
        return { pivot, side }
    })

    for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), material)
        leg.position.set(0.15, -0.8, side * 0.25)
        body.add(leg)
    }

    crow.traverse((object) => {
        if (object.isMesh) object.castShadow = true
    })
    return { crow, body, head, wings }
}

/* ------------------------------------------------------------------ */
/* Décor                                                               */
/* ------------------------------------------------------------------ */

// Toile d'araignée en quart (ou portion) de cercle dans le plan xy : rayons + fils concentriques qui fléchissent
const buildWeb = (THREE, { radius, from, to, spokes = 6, rings = 5 }) => {
    const vertices = []
    const angleAt = (index) => from + ((to - from) * index) / (spokes - 1)
    const point = (angle, r) => [Math.cos(angle) * r, Math.sin(angle) * r, 0]
    for (let s = 0; s < spokes; s++) vertices.push(...point(angleAt(s), 0), ...point(angleAt(s), radius))
    for (let ring = 1; ring <= rings; ring++) {
        const r = (radius * ring) / (rings + 0.4)
        for (let s = 0; s < spokes - 1; s++) {
            // Chaque fil fléchit vers le centre entre deux rayons
            const steps = 4
            for (let k = 0; k < steps; k++) {
                const a0 = angleAt(s) + ((angleAt(s + 1) - angleAt(s)) * k) / steps
                const a1 = angleAt(s) + ((angleAt(s + 1) - angleAt(s)) * (k + 1)) / steps
                const sag = (u) => r * (1 - 0.12 * Math.sin(Math.PI * u))
                vertices.push(...point(a0, sag(k / steps)), ...point(a1, sag((k + 1) / steps)))
            }
        }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: COLORS.web, transparent: true, opacity: 0.85 }))
}

// Pose un objet sur une hauteur donnée (après rotation) : son point le plus bas touche y
const restOn = (THREE, object, y) => {
    object.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(object)
    object.position.y += y - box.min.y
}

/* ------------------------------------------------------------------ */
/* Scène                                                               */
/* ------------------------------------------------------------------ */

export async function createScene(THREE, { reducedMotion, font, t }) {
    const gltf = await new THREE.GLTFLoader().loadAsync(MODEL_URL)
    const root = new THREE.Group()
    const model = gltf.scene
    const nodes = {}
    model.traverse((object) => {
        if (object.name) nodes[object.name] = object
        if (object.isMesh) {
            object.castShadow = true
            object.receiveShadow = true
        }
    })
    const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3())
    model.position.set(-center.x, 0, -center.z)
    root.add(model)
    root.updateMatrixWorld(true)
    const boxOf = (object) => {
        object.updateMatrixWorld(true)
        return new THREE.Box3().setFromObject(object)
    }
    const deskBox = boxOf(nodes.desk)
    const deskTop = deskBox.max.y
    const disposables = []

    // Poussière sur tout le mobilier, plantes séchées
    const dust = new THREE.Color(COLORS.dust)
    let lampMaterial = null
    const seen = new Set()
    model.traverse((object) => {
        if (!object.isMesh) return
        for (const material of [].concat(object.material)) {
            if (seen.has(material)) continue
            seen.add(material)
            if (material.name.startsWith('lamp')) lampMaterial = material
            if (material.name.startsWith('plant')) material.color.set(material.name === 'plant.001' ? COLORS.driedDark : COLORS.dried)
            else material.color.lerp(dust, 0.25)
            material.roughness = 1
            material.metalness = 0
        }
    })

    // Plantes fanées, affaissées
    nodes.plant.rotation.z += 0.4
    nodes.plant.scale.y *= 0.8
    nodes.bigplant.rotation.z -= 0.3
    nodes.bigplant.rotation.x += 0.15
    nodes.bigplant.scale.y *= 0.85

    // Livres tombés sur le côté
    nodes.books.rotation.z += 1.35
    restOn(THREE, nodes.books, deskTop)

    // Lampe de travers
    nodes.lamp.rotation.z += 0.18

    // Chaise renversée sur le côté, juste devant l'angle droit du bureau
    const chair = nodes.chair
    chair.rotation.set(0, chair.rotation.y + 0.7, -Math.PI / 2)
    restOn(THREE, chair, 0)
    const chairBox = boxOf(chair)
    chair.position.x += deskBox.max.x - 0.12 - (chairBox.min.x + chairBox.max.x) / 2
    chair.position.z += deskBox.max.z + 0.02 - chairBox.min.z

    /* Écran en veille ------------------------------------------------- */
    const screenCanvas = document.createElement('canvas')
    screenCanvas.width = 1024
    screenCanvas.height = 600
    const screenTexture = new THREE.CanvasTexture(screenCanvas)
    screenTexture.colorSpace = THREE.SRGBColorSpace
    // UV au format glTF (origine en haut à gauche)
    screenTexture.flipY = false
    screenTexture.anisotropy = 4
    disposables.push(screenTexture)
    const display = nodes.screen_display
    display.material.dispose()
    display.material = new THREE.MeshBasicMaterial({ map: screenTexture })
    display.castShadow = false

    let cursorOn = true
    const drawScreen = (glitch = 0) => {
        const context = screenCanvas.getContext('2d')
        const { width, height } = screenCanvas
        context.fillStyle = COLORS.screenBg
        context.fillRect(0, 0, width, height)
        context.textAlign = 'center'
        context.textBaseline = 'middle'

        context.font = `800 260px ${font}`
        if (glitch) {
            // Aberration chromatique : copies décalées du 404 aux couleurs du site
            context.globalAlpha = 0.7
            context.fillStyle = COLORS.accent
            context.fillText('404', width / 2 - glitch * 14, height * 0.42)
            context.fillStyle = COLORS.key
            context.fillText('404', width / 2 + glitch * 14, height * 0.42)
            context.globalAlpha = 1
        }
        context.fillStyle = glitch ? COLORS.screenMuted : COLORS.screenText
        context.fillText('404', width / 2, height * 0.42)

        context.font = `600 44px ${font}`
        context.fillStyle = COLORS.screenMuted
        const line = t('notFound.scene.screen')
        context.fillText(line, width / 2, height * 0.76)
        if (cursorOn) {
            const end = width / 2 + context.measureText(line).width / 2
            context.fillRect(end + 12, height * 0.76 - 22, 22, 44)
        }

        // Lignes de balayage
        context.fillStyle = 'rgba(255, 255, 255, 0.035)'
        for (let y = 0; y < height; y += 6) context.fillRect(0, y, width, 2)

        // Glitch : bandes horizontales décalées
        if (glitch) {
            for (let k = 0; k < 6; k++) {
                const y = Math.random() * height
                const band = 10 + Math.random() * 40
                context.drawImage(screenCanvas, 0, y, width, band, (Math.random() - 0.5) * 80 * glitch, y, width, band)
            }
        }
        screenTexture.needsUpdate = true
    }

    /* Post-it sur l'écran --------------------------------------------- */
    const postitCanvas = document.createElement('canvas')
    postitCanvas.width = postitCanvas.height = 256
    const postitTexture = new THREE.CanvasTexture(postitCanvas)
    postitTexture.colorSpace = THREE.SRGBColorSpace
    disposables.push(postitTexture)
    const drawPostit = () => {
        const context = postitCanvas.getContext('2d')
        context.fillStyle = COLORS.key
        context.fillRect(0, 0, 256, 256)
        context.fillStyle = 'rgba(0, 0, 0, 0.06)'
        context.fillRect(0, 0, 256, 40)
        context.fillStyle = COLORS.screenText
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        const lines = t('notFound.scene.postit').split('\n')
        context.font = `700 ${lines.length > 1 ? 48 : 58}px ${font}`
        lines.forEach((text, index) => context.fillText(text, 128, 140 + (index - (lines.length - 1) / 2) * 56))
        postitTexture.needsUpdate = true
    }
    const screenBox = boxOf(nodes.screen)
    const displayBox = boxOf(display)
    const postitPivot = new THREE.Group()
    // Collé par le haut sur le coin bas droit du moniteur, à cheval sur le cadre (le texte de l'écran reste lisible)
    postitPivot.position.set(displayBox.max.x - 0.03, displayBox.min.y + 0.03, screenBox.max.z + 0.004)
    postitPivot.rotation.z = -0.12
    const postit = new THREE.Mesh(
        new THREE.PlaneGeometry(0.07, 0.07),
        new THREE.MeshStandardMaterial({ map: postitTexture, roughness: 1, side: THREE.DoubleSide })
    )
    postit.position.y = -0.035
    postitPivot.add(postit)
    root.add(postitPivot)

    const flutter = () => {
        if (reducedMotion) return
        gsap.killTweensOf(postitPivot.rotation)
        gsap.timeline()
            .to(postitPivot.rotation, { x: -0.6, duration: 0.12, ease: 'power2.out' })
            .to(postitPivot.rotation, { x: 0, duration: 1.2, ease: 'elastic.out(1, 0.25)' })
    }

    /* Toiles d'araignée ----------------------------------------------- */
    // Entre le pied de l'écran et la lampe
    const webScreen = buildWeb(THREE, { radius: 0.14, from: Math.PI / 2, to: Math.PI })
    webScreen.position.set(screenBox.min.x + 0.01, deskTop + 0.002, (screenBox.min.z + screenBox.max.z) / 2)
    // Sous le plateau, dans l'angle avant gauche
    const webDesk = buildWeb(THREE, { radius: 0.2, from: -Math.PI / 2, to: 0, spokes: 7, rings: 6 })
    webDesk.position.set(deskBox.min.x + 0.03, deskTop - 0.035, deskBox.max.z - 0.03)
    root.add(webScreen, webDesk)

    /* Feuilles au sol -------------------------------------------------- */
    const paperGeometry = new THREE.PlaneGeometry(0.09, 0.12)
    const paperMaterial = new THREE.MeshStandardMaterial({ color: COLORS.paper, roughness: 1, side: THREE.DoubleSide })
    const sheets = [[0.05, 0.22, 0.4], [0.18, 0.3, -0.5], [-0.15, 0.32, 1.1], [0.3, 0.12, 2.2], [-0.32, 0.18, -0.2]]
    sheets.forEach(([x, z, yaw], index) => {
        const sheet = new THREE.Mesh(paperGeometry, paperMaterial)
        sheet.rotation.set(-Math.PI / 2, 0, yaw)
        sheet.position.set(x, 0.002 + index * 0.0008, deskBox.max.z - 0.1 + z)
        sheet.receiveShadow = true
        root.add(sheet)
    })

    /* Poussière en suspension ----------------------------------------- */
    const DUST_COUNT = 180
    const dustPositions = new Float32Array(DUST_COUNT * 3)
    const dustSeeds = new Float32Array(DUST_COUNT)
    for (let i = 0; i < DUST_COUNT; i++) {
        dustPositions[i * 3] = rand(-0.7, 0.7)
        dustPositions[i * 3 + 1] = rand(0.05, 1.1)
        dustPositions[i * 3 + 2] = rand(-0.4, 0.6)
        dustSeeds[i] = Math.random() * Math.PI * 2
    }
    const dustGeometry = new THREE.BufferGeometry()
    dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3))
    const dustCloud = new THREE.Points(dustGeometry, new THREE.PointsMaterial({
        color: COLORS.dust,
        size: 0.008,
        transparent: true,
        opacity: 0.7,
        depthWrite: false
    }))
    root.add(dustCloud)

    /* Lumières --------------------------------------------------------- */
    // Ambiance plus froide et plus terne que sur la home
    const lights = []
    lights.push(new THREE.HemisphereLight(0xe4ebeb, 0x2f4a4f, 1.3))
    const keyLight = new THREE.DirectionalLight(0xf2f0ea, 1.9)
    keyLight.position.set(-1.5, 3, 2)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    Object.assign(keyLight.shadow.camera, { left: -1.5, right: 1.5, top: 1.5, bottom: -1.5, near: 0.5, far: 8 })
    keyLight.shadow.radius = 4
    keyLight.shadow.normalBias = 0.01
    lights.push(keyLight)

    // Lampe : ampoule mourante (éteinte, grésille par moments)
    const lampLight = new THREE.PointLight(0xffd9a0, 0, 1.4, 2)
    lampLight.position.set(0, 0.2, 0)
    nodes.lamp.add(lampLight)
    // Lueur de l'écran quand il glitche
    const screenGlow = new THREE.PointLight(0x9fd3b5, 0, 0.8, 2)
    screenGlow.position.set((displayBox.min.x + displayBox.max.x) / 2, (displayBox.min.y + displayBox.max.y) / 2, screenBox.max.z + 0.1)
    root.add(screenGlow)

    const setLamp = (on) => {
        lampLight.intensity = on ? 0.35 : 0
        if (lampMaterial) {
            lampMaterial.emissive.set(on ? 0xf4d58a : 0x000000)
            lampMaterial.emissiveIntensity = on ? 0.7 : 0
        }
    }
    setLamp(false)

    /* Corbeau ---------------------------------------------------------- */
    const bird = buildCrow(THREE)
    const { crow, head, wings } = bird
    root.add(crow)
    const perch = new THREE.Vector3(
        (screenBox.min.x + screenBox.max.x) / 2 + 0.06,
        screenBox.max.y,
        (screenBox.min.z + screenBox.max.z) / 2
    )
    // Ailes : angle (positif = vers le haut) et repli (1 = déployées)
    const wing = { angle: 0, spread: 1, flap: 1 }
    const flight = { u: 0 }
    let crowState = 'away'
    let curve = null
    let side = 1
    let crowTimer = null
    let nextLook = 0
    // isOffscreen(point) : vrai si un point (repère du bureau) est hors du canvas ; fourni par le composant
    let isOffscreen = null
    const probe = new THREE.Vector3()

    // Abscisse hors-champ côté `sign` à la hauteur/profondeur données : on s'éloigne du bureau jusqu'à sortir du canvas
    const offscreenX = (sign, y, z) => {
        if (!isOffscreen) return sign * OFFSCREEN_X
        let x = sign
        while (!isOffscreen(probe.set(x, y, z)) && Math.abs(x) < 40) x += sign * 0.25
        return x + sign * OFFSCREEN_MARGIN
    }

    const flightDuration = (base) => base * Math.sqrt(Math.max(1, curve.getLength() / BASE_FLIGHT_LENGTH))

    const foldWings = (folded, duration = 0.3) => {
        gsap.to(wing, { spread: folded ? 0.3 : 1, angle: folded ? -0.2 : 0, flap: folded ? 0 : 1, duration })
    }

    const land = () => {
        crowState = 'perched'
        crow.position.copy(perch)
        foldWings(true)
        gsap.to(crow.rotation, { y: PERCH_YAW, z: 0, duration: 0.4, ease: 'power2.out' })
        // Atterrissage : l'écran grésille, le post-it tremble
        glitchFor(0.35)
        flutter()
        crowTimer = gsap.delayedCall(rand(5, 8), leave)
    }

    function arrive() {
        side = Math.random() < 0.5 ? -1 : 1
        const startY = rand(1.6, 2)
        const startZ = rand(0.4, 1)
        curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(offscreenX(side, startY, startZ), startY, startZ),
            new THREE.Vector3(side * 1.2, rand(0.95, 1.2), 0.5),
            new THREE.Vector3(perch.x + side * 0.28, perch.y + 0.16, perch.z + 0.06),
            perch.clone()
        ])
        crowState = 'arriving'
        crow.visible = true
        flight.u = 0
        foldWings(false, 0.01)
        gsap.to(flight, { u: 1, duration: flightDuration(3.4), ease: 'power2.out', onComplete: land })
    }

    function leave(startled = false) {
        if (crowState !== 'perched') return
        if (crowTimer) crowTimer.kill()
        const direction = Math.random() < 0.5 ? -1 : 1
        const endY = rand(1.8, 2.2)
        const endZ = rand(0, 0.6)
        curve = new THREE.CatmullRomCurve3([
            perch.clone(),
            new THREE.Vector3(perch.x + direction * 0.25, perch.y + 0.22, perch.z + 0.12),
            new THREE.Vector3(direction * 1.4, rand(1.1, 1.4), 0.4),
            new THREE.Vector3(offscreenX(direction, endY, endZ), endY, endZ)
        ])
        crowState = 'leaving'
        flight.u = 0
        foldWings(false, 0.12)
        flutter()
        gsap.to(flight, {
            u: 1,
            duration: flightDuration(startled ? 1.8 : 2.8),
            ease: 'power2.in',
            onComplete: () => {
                crowState = 'away'
                crow.visible = false
                crowTimer = gsap.delayedCall(rand(6, 12), arrive)
            }
        })
    }

    const lookAround = () => {
        gsap.to(head.rotation, { y: rand(-0.9, 0.9), z: rand(-0.15, 0.25), duration: 0.18, ease: 'power2.out' })
    }

    const hop = () => {
        gsap.timeline()
            .to(crow.position, { y: perch.y + 0.03, duration: 0.12, ease: 'power2.out' })
            .to(crow.position, { y: perch.y, duration: 0.12, ease: 'power2.in' })
    }

    if (reducedMotion) {
        // Pas de vol : le corbeau est déjà là
        crowState = 'perched'
        crow.position.copy(perch)
        crow.rotation.y = PERCH_YAW
        wing.spread = 0.3
        wing.angle = -0.2
        wing.flap = 0
    } else {
        crow.visible = false
        crowTimer = gsap.delayedCall(1.2, arrive)
    }

    /* Glitch et grésillement ------------------------------------------- */
    let glitchUntil = 0
    let lampUntil = 0
    let nextGlitch = 0
    let nextLamp = 0
    let nextLampToggle = 0
    let lastBlink = -1
    let now = 0

    function glitchFor(seconds) {
        glitchUntil = Math.max(glitchUntil, now + seconds * 1000)
    }
    const crackle = (seconds) => {
        lampUntil = Math.max(lampUntil, now + seconds * 1000)
    }

    const wiggle = (object, axis, amplitude) => {
        const base = object.rotation[axis]
        gsap.killTweensOf(object.rotation)
        if (reducedMotion) return
        gsap.timeline()
            .to(object.rotation, { [axis]: base + amplitude, duration: 0.1, ease: 'power1.out' })
            .to(object.rotation, { [axis]: base, duration: 0.9, ease: 'elastic.out(1.2, 0.25)' })
    }

    const interact = (name) => {
        switch (name) {
            case 'crow':
                if (reducedMotion) lookAround()
                else leave(true)
                break
            case 'screen':
                glitchFor(0.6)
                if (crowState === 'perched' && !reducedMotion) leave(true)
                break
            case 'lamp':
                crackle(1.2)
                break
            case 'chair':
                wiggle(chair, 'x', 0.12)
                break
            case 'plant':
            case 'bigplant':
                wiggle(nodes[name], 'x', 0.2)
                break
        }
    }

    /* Boucle ----------------------------------------------------------- */
    const position = new THREE.Vector3()
    const tangent = new THREE.Vector3()
    let lastTime = null

    const update = (time) => {
        now = time
        const delta = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, 0.1)
        lastTime = time

        // Glitchs et grésillements automatiques
        if (!reducedMotion) {
            if (time > nextGlitch) {
                if (nextGlitch) glitchFor(rand(0.15, 0.4))
                nextGlitch = time + rand(4000, 9000)
            }
            if (time > nextLamp) {
                if (nextLamp) crackle(rand(0.4, 1))
                nextLamp = time + rand(5000, 11000)
            }
        }

        // Écran : glitch image par image, sinon curseur clignotant redessiné deux fois par seconde
        const blink = reducedMotion ? 1 : Math.floor(time / 530) % 2
        if (time < glitchUntil) {
            drawScreen(Math.random() * 0.8 + 0.2)
            screenGlow.intensity = Math.random() * 0.4
            lastBlink = -1
        } else if (blink !== lastBlink) {
            lastBlink = blink
            cursorOn = blink === 1
            drawScreen()
            screenGlow.intensity = 0
        }

        // Lampe : ampoule qui hésite entre allumée et éteinte
        if (time < lampUntil) {
            if (time > nextLampToggle) {
                setLamp(Math.random() < 0.55)
                nextLampToggle = time + rand(30, 120)
            }
        } else if (lampLight.intensity) {
            setLamp(false)
        }

        // Poussière qui dérive lentement
        if (!reducedMotion) {
            const array = dustGeometry.attributes.position.array
            for (let i = 0; i < DUST_COUNT; i++) {
                const seed = dustSeeds[i]
                array[i * 3] += Math.sin(time * 0.0003 + seed) * 0.0004
                array[i * 3 + 1] += 0.004 * delta * (0.5 + Math.sin(seed))
                array[i * 3 + 2] += Math.cos(time * 0.00025 + seed) * 0.0003
                if (array[i * 3 + 1] > 1.1) array[i * 3 + 1] = 0.05
            }
            dustGeometry.attributes.position.needsUpdate = true
        }

        // Corbeau
        if (crowState === 'arriving' || crowState === 'leaving') {
            curve.getPointAt(flight.u, position)
            curve.getTangentAt(Math.min(flight.u, 0.999), tangent)
            crow.position.copy(position)
            crow.rotation.y = Math.atan2(-tangent.z, tangent.x)
            crow.rotation.z = Math.atan2(tangent.y, Math.hypot(tangent.x, tangent.z)) * 0.6
            // Plané en approche, battements rapides au décollage
            const landing = crowState === 'arriving' && flight.u > 0.8
            const speed = crowState === 'leaving' ? 0.03 : 0.022
            wing.angle = landing ? 0.5 : Math.sin(time * speed) * 0.9
        } else if (crowState === 'perched' && !reducedMotion && time > nextLook) {
            nextLook = time + rand(700, 1800)
            if (Math.random() < 0.25) hop()
            else lookAround()
        }
        for (const { pivot, side: wingSide } of wings) {
            pivot.rotation.x = -wingSide * wing.angle
            pivot.scale.z = wing.spread
        }
    }

    drawScreen()
    drawPostit()

    return {
        root,
        lights,
        // Cadrage : sphère englobante du bureau (rayon fixe : la rotation au curseur ne change pas le cadrage)
        view: { target: [0, 0.38, 0.12], radius: 0.62, direction: [0, 0.65, 1], yaw: BASE_YAW },
        targets: [
            { name: 'crow', object: crow },
            { name: 'screen', object: nodes.screen },
            { name: 'lamp', object: nodes.lamp },
            { name: 'chair', object: chair },
            { name: 'plant', object: nodes.plant },
            { name: 'bigplant', object: nodes.bigplant }
        ],
        // Équivalents clavier des clics (libellés notFound.scene.actions.<key>)
        actions: ['crow', 'screen', 'lamp'],
        update,
        interact,
        setFlightBounds(fn) {
            isOffscreen = fn
        },
        redraw() {
            drawScreen()
            drawPostit()
        },
        dispose() {
            if (crowTimer) crowTimer.kill()
            gsap.killTweensOf([wing, flight, crow.position, crow.rotation, head.rotation, postitPivot.rotation, chair.rotation, nodes.plant.rotation, nodes.bigplant.rotation])
            disposables.forEach((texture) => texture.dispose())
        }
    }
}
