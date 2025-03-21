import { AmbientLight, CircleGeometry, Color, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, SpotLight, WebGLRenderer } from 'three'

import {
    FIELD_EXTENDED_LENGTH,
    FIELD_EXTENDED_LENGTH_HALF,
    FIELD_EXTENDED_WIDTH,
    FIELD_EXTENDED_WIDTH_HALF,
    FIELD_LENGTH_HALF,
    MATH_PI_HALF
} from '../constants'
import { Cloud } from './cloud'
import { Field } from './field'
import { Goal } from './goal'
import { Tree } from './tree'

// North: Positive Z
// South: Negative Z
// East: Negative X
// West: Positive X

export class World {
    scene: Scene
    camera: PerspectiveCamera
    renderer: WebGLRenderer
    private groundRadius: number

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

        // Ground Radius
        this.groundRadius = Math.max(FIELD_EXTENDED_WIDTH, FIELD_EXTENDED_LENGTH) * 1.2

        // Global Lighting
        this.scene.add(new AmbientLight()) // Even darker ambient

        // Top Down Lighting (Players and Ball)
        const topLight = new DirectionalLight(0xffffff, 0.2)
        topLight.position.set(0, 10, 0)
        topLight.castShadow = true
        topLight.shadow.mapSize.width = 1000
        topLight.shadow.mapSize.height = 1000
        topLight.shadow.camera.far = 11
        topLight.shadow.camera.left = -FIELD_EXTENDED_WIDTH_HALF
        topLight.shadow.camera.right = FIELD_EXTENDED_WIDTH_HALF
        topLight.shadow.camera.top = FIELD_EXTENDED_LENGTH_HALF
        topLight.shadow.camera.bottom = -FIELD_EXTENDED_LENGTH_HALF
        this.scene.add(topLight)

        // Corner Spotlights
        const createCornerLight = (x: number, z: number) => {
            const light = new SpotLight()
            light.position.set(x, 30, z)
            light.castShadow = true
            light.target.position.set(0, 0, 0)
            light.penumbra = 0
            light.decay = 0
            light.distance = 100
            light.shadow.mapSize.width = 1000
            light.shadow.mapSize.height = 1000
            light.shadow.camera.near = 1
            light.shadow.camera.far = 100
            this.scene.add(light)
            this.scene.add(light.target)

            // DO NOT DELETE
            // Add helpers to visualize the light
            // const helper = new SpotLightHelper(light)
            // this.scene.add(helper)
            // const shadowHelper = new CameraHelper(light.shadow.camera)
            // this.scene.add(shadowHelper)

            return light
        }

        // Add lights at each corner with more spread out positions
        const cornerOffset = 10 // Add some extra offset from the field edges
        createCornerLight(FIELD_EXTENDED_WIDTH_HALF + cornerOffset, FIELD_EXTENDED_LENGTH_HALF + cornerOffset) // Northeast
        createCornerLight(-FIELD_EXTENDED_WIDTH_HALF - cornerOffset, FIELD_EXTENDED_LENGTH_HALF + cornerOffset) // Northwest
        createCornerLight(FIELD_EXTENDED_WIDTH_HALF + cornerOffset, -FIELD_EXTENDED_LENGTH_HALF - cornerOffset) // Southeast
        createCornerLight(-FIELD_EXTENDED_WIDTH_HALF - cornerOffset, -FIELD_EXTENDED_LENGTH_HALF - cornerOffset) // Southwest

        // Elements
        this.createGround()
        this.createTrees()
        this.createClouds()
        this.scene.add(new Field().mesh)

        // Goals
        const northGoal = new Goal()
        northGoal.mesh.position.set(0, 0, FIELD_LENGTH_HALF)
        this.scene.add(northGoal.mesh)
        const southGoal = new Goal()
        southGoal.mesh.position.set(0, 0, -FIELD_LENGTH_HALF)
        this.scene.add(southGoal.mesh)
    }

    private createGround() {
        const groundGeometry = new CircleGeometry(this.groundRadius, 32)
        const groundMaterial = new MeshStandardMaterial({ color: 0x90ee90 }) // Light Green
        const ground = new Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = -MATH_PI_HALF
        ground.receiveShadow = true

        this.scene.add(ground)
    }

    private createTrees() {
        let generated = 0
        while (generated < 220) {
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * this.groundRadius
            const x = radius * Math.cos(angle)
            const z = radius * Math.sin(angle)
            if (Math.abs(x) <= FIELD_EXTENDED_WIDTH_HALF + 10 && Math.abs(z) <= FIELD_EXTENDED_LENGTH_HALF + 10) {
                continue
            }
            const tree = new Tree(3 + Math.random() * 3, 2 + Math.random() * 1)
            tree.mesh.position.set(x, 0, z)
            this.scene.add(tree.mesh)
            generated++
        }
    }

    private createClouds() {
        for (let i = 0; i < 200; i++) {
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * this.groundRadius
            const cloud = new Cloud(1 + Math.random() * 3)
            cloud.mesh.position.set(radius * Math.cos(angle), 20 + Math.random() * 10, radius * Math.sin(angle))
            this.scene.add(cloud.mesh)
        }
    }
}
