import { AmbientLight, CircleGeometry, Color, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

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
import { Wall } from './wall'

// North: -z
// South: z
// East: x
// West: -x

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
        this.camera.position.set(0, 7, 20)
        this.camera.lookAt(0, 0, 0)
        this.camera.layers.enableAll()

        // Renderer
        this.renderer = new WebGLRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.shadowMap.enabled = true
        document.body.appendChild(this.renderer.domElement)

        // Ground Radius
        this.groundRadius = Math.max(FIELD_EXTENDED_WIDTH, FIELD_EXTENDED_LENGTH) * 1.2

        // Global Lighting
        this.scene.add(new AmbientLight())

        // Top Down Lighting
        const topLight = new DirectionalLight()
        topLight.position.set(0, 10, 0)
        topLight.castShadow = true
        topLight.shadow.mapSize.width = 1000
        topLight.shadow.mapSize.height = 1000
        topLight.shadow.camera.far = topLight.position.y + 1
        topLight.shadow.camera.left = -FIELD_EXTENDED_WIDTH_HALF
        topLight.shadow.camera.right = FIELD_EXTENDED_WIDTH_HALF
        topLight.shadow.camera.top = FIELD_EXTENDED_LENGTH_HALF
        topLight.shadow.camera.bottom = -FIELD_EXTENDED_LENGTH_HALF
        this.scene.add(topLight)

        // Elements
        this.createGround()
        this.createTrees()
        this.createClouds()
        this.scene.add(new Wall().mesh)
        this.scene.add(new Field().mesh)

        // Goals
        const northGoal = new Goal()
        northGoal.mesh.position.set(0, 0, -FIELD_LENGTH_HALF)
        this.scene.add(northGoal.mesh)
        const southGoal = new Goal()
        southGoal.mesh.rotation.y = Math.PI
        southGoal.mesh.position.set(0, 0, FIELD_LENGTH_HALF)
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
            if (Math.abs(x) <= FIELD_EXTENDED_WIDTH_HALF + 2 && Math.abs(z) <= FIELD_EXTENDED_LENGTH_HALF + 2) {
                continue
            }
            const tree = new Tree(3 + Math.random() * 3, 2 + Math.random() * 1)
            tree.mesh.position.set(x, 0, z)
            this.scene.add(tree.mesh)
            generated++
        }
    }

    private createClouds() {
        for (let i = 0; i < 140; i++) {
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * this.groundRadius - this.groundRadius / 4
            const x = radius * Math.cos(angle)
            const z = radius * Math.sin(angle)
            const cloud = new Cloud(1 + Math.random() * 3)
            cloud.mesh.position.set(x, 20 + Math.random() * 10, z)
            this.scene.add(cloud.mesh)
        }
    }
}
