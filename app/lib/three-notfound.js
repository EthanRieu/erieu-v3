/**
 * Sous-ensemble de three.js utilisé par NotFoundScene (même principe que three-desk.js) :
 * importé dynamiquement, il reste hors du bundle initial et seules ces classes sont bundlées.
 * La scène elle-même est construite dans lib/notfound-desk.js.
 */
export {
    Box3,
    BoxGeometry,
    BufferGeometry,
    CanvasTexture,
    CatmullRomCurve3,
    Color,
    ConeGeometry,
    DirectionalLight,
    DoubleSide,
    Float32BufferAttribute,
    Group,
    HemisphereLight,
    IcosahedronGeometry,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    PointLight,
    Points,
    PointsMaterial,
    Raycaster,
    Scene,
    ShadowMaterial,
    SRGBColorSpace,
    Vector3,
    WebGLRenderer
} from 'three'
export { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
