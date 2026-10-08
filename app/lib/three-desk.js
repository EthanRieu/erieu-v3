/**
 * Sous-ensemble de three.js utilisé par DeskScene (même principe que three-toolbox.js) :
 * importé dynamiquement, il reste hors du bundle initial et seules ces classes sont bundlées.
 * Placé hors de `utils/` pour ne pas être exposé aux auto-imports Nuxt.
 */
export {
    Box3,
    CanvasTexture,
    Color,
    DirectionalLight,
    Group,
    HemisphereLight,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    PointLight,
    Raycaster,
    Scene,
    ShadowMaterial,
    SRGBColorSpace,
    Vector3,
    WebGLRenderer
} from 'three'
export { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
