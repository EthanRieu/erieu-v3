/**
 * Sous-ensemble de three.js réellement utilisé par SignatureScene.
 * Importer ce module (plutôt que `three` en entier) permet à Rollup de ne bundler que ces classes
 * et leurs dépendances dans le chunk chargé à la demande.
 * Placé hors de `utils/` pour ne pas être exposé aux auto-imports Nuxt.
 */
export {
    BufferAttribute,
    CatmullRomCurve3,
    Color,
    DirectionalLight,
    Group,
    HemisphereLight,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    TubeGeometry,
    Vector3,
    WebGLRenderer
} from 'three'
