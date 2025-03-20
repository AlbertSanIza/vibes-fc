import { AmbientLight, AxesHelper, CircleGeometry, Color, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

import { FIELD_EXTENDED_LENGTH, FIELD_EXTENDED_LENGTH_HALF, FIELD_EXTENDED_WIDTH, FIELD_EXTENDED_WIDTH_HALF, MATH_PI_HALF } from '../constants'

export class World {
    scene: Scene
    camera: PerspectiveCamera
    renderer: WebGLRenderer

    constructor() {
        // Scene
        this.scene = new Scene()
        this.scene.background = new Color(0x87ceeb) // Sky blue background

        // Camera
        this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight)
        this.camera.layers.enableAll()

        // Renderer
        this.renderer = new WebGLRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.shadowMap.enabled = true
        document.body.appendChild(this.renderer.domElement)

        // Axes Helper
        this.scene.add(new AxesHelper(20))

        // Global Lighting
        this.scene.add(new AmbientLight())

        // Top Down Lighting (Players and Ball)
        const topLight = new DirectionalLight()
        topLight.position.set(0, 20, 0)
        topLight.castShadow = true
        topLight.shadow.mapSize.width = 1000
        topLight.shadow.mapSize.height = 1000
        topLight.shadow.camera.near = 0.5
        topLight.shadow.camera.far = 50
        topLight.shadow.camera.left = -FIELD_EXTENDED_WIDTH_HALF
        topLight.shadow.camera.right = FIELD_EXTENDED_WIDTH_HALF
        topLight.shadow.camera.top = FIELD_EXTENDED_LENGTH_HALF
        topLight.shadow.camera.bottom = -FIELD_EXTENDED_LENGTH_HALF
        this.scene.add(topLight)

        // Elements
        this.createGround()
    }

    private createGround() {
        const groundGeometry = new CircleGeometry(Math.max(FIELD_EXTENDED_WIDTH, FIELD_EXTENDED_LENGTH) * 1.5, 32)
        const groundMaterial = new MeshStandardMaterial({ color: 0x90ee90 }) // Light Green
        const ground = new Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = -MATH_PI_HALF
        ground.position.y = -0.1
        ground.receiveShadow = true

        this.scene.add(ground)
    }
}
