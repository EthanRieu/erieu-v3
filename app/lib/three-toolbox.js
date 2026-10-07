/**
 * Sous-ensemble de three.js utilisé par ToolboxScene (même principe que three-subset.js) :
 * importé dynamiquement, il reste hors du bundle initial et seules ces classes sont bundlées.
 */
export {
    DirectionalLight,
    HemisphereLight,
    Group,
    Mesh,
    PMREMGenerator,
    PerspectiveCamera,
    Plane,
    PlaneGeometry,
    Raycaster,
    Scene,
    ShadowMaterial,
    Vector3,
    WebGLRenderer
} from 'three'
export { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
export { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
