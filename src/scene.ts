import * as THREE from 'three'

import {
    FIELD_EXTRA_LENGTH,
    FIELD_EXTRA_WIDTH,
    FIELD_GOAL_HEIGHT,
    FIELD_GOAL_POST_RADIUS,
    FIELD_GOAL_WIDTH,
    FIELD_LENGTH,
    FIELD_LINE_COLOR,
    FIELD_LINE_THICKNESS,
    FIELD_WIDTH
} from './constants'

export class Scene {
    public scene: THREE.Scene
    public camera: THREE.PerspectiveCamera
    public renderer: THREE.WebGLRenderer

    constructor() {
        // Scene
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0x87ceeb) // Sky blue background

        // Camera
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight)
        this.camera.layers.enableAll()

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.shadowMap.enabled = true
        document.body.appendChild(this.renderer.domElement)

        // Create layers
        const LAYER_GENERAL = 0 // Default layer
        const LAYER_DYNAMIC = 1 // Layer for player and ball

        // Global Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        this.scene.add(ambientLight)

        // Top Down Lighting (Players and Ball)
        const topLight = new THREE.DirectionalLight(0xffffff, 1)
        topLight.position.set(0, 10, 0)
        topLight.castShadow = true

        // Configure shadow properties for top light
        topLight.shadow.mapSize.width = 4096
        topLight.shadow.mapSize.height = 4096
        topLight.shadow.camera.near = 0.5
        topLight.shadow.camera.far = 50
        const shadowWidth = (FIELD_WIDTH + FIELD_EXTRA_WIDTH) / 2
        const shadowLength = (FIELD_LENGTH + FIELD_EXTRA_LENGTH) / 2
        topLight.shadow.camera.left = -shadowWidth
        topLight.shadow.camera.right = shadowWidth
        topLight.shadow.camera.top = shadowLength
        topLight.shadow.camera.bottom = -shadowLength

        // Set top light to only affect dynamic objects (player and ball)
        topLight.layers.set(LAYER_DYNAMIC)
        this.scene.add(topLight)

        // Angled light for environment objects
        const angledLight = new THREE.DirectionalLight(0xffffff, 0.8)
        angledLight.position.set(-10, 8, -10)
        angledLight.castShadow = true

        // Configure shadow properties for angled light
        angledLight.shadow.mapSize.width = 4096
        angledLight.shadow.mapSize.height = 4096
        angledLight.shadow.camera.near = 0.5
        angledLight.shadow.camera.far = 50
        angledLight.shadow.camera.left = -shadowWidth * 1.5
        angledLight.shadow.camera.right = shadowWidth * 1.5
        angledLight.shadow.camera.top = shadowLength * 1.5
        angledLight.shadow.camera.bottom = -shadowLength * 1.5

        // Set angled light to only affect general objects
        angledLight.layers.set(LAYER_GENERAL)
        this.scene.add(angledLight)

        // Store layers in window for access from game.ts
        ;(window as any).LAYER_GENERAL = LAYER_GENERAL
        ;(window as any).LAYER_DYNAMIC = LAYER_DYNAMIC

        // Elements
        this.createGround()
        this.createSoccerField()
        this.createTrees()
        this.createClouds()

        // Expose scene, camera, and renderer to window object for game.ts
        ;(window as any).scene = this.scene
        ;(window as any).camera = this.camera
        ;(window as any).renderer = this.renderer
    }

    private createGround() {
        const groundGeometry = new THREE.CircleGeometry(Math.max(FIELD_WIDTH + FIELD_EXTRA_WIDTH, FIELD_LENGTH + FIELD_EXTRA_LENGTH) * 1.5, 32)
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x90ee90 }) // Light Green
        const ground = new THREE.Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = -Math.PI / 2
        ground.position.y = -0.1
        ground.receiveShadow = true
        ground.layers.enable((window as any).LAYER_GENERAL)
        this.scene.add(ground)
    }

    private createSoccerField() {
        // North: Positive Z
        // South: Negative Z
        // East: Negative X
        // West: Positive X

        const halfWidth = FIELD_WIDTH / 2
        const halfLength = FIELD_LENGTH / 2

        // Main Field
        const mainFieldGeometry = new THREE.PlaneGeometry(FIELD_WIDTH + FIELD_EXTRA_WIDTH, FIELD_LENGTH + FIELD_EXTRA_LENGTH)
        const mainFieldMaterial = new THREE.MeshStandardMaterial({ color: 0x2e8b57 }) // Forest green
        const mainField = new THREE.Mesh(mainFieldGeometry, mainFieldMaterial)
        mainField.rotation.x = -Math.PI / 2
        mainField.receiveShadow = true
        this.scene.add(mainField)

        const createFieldLine = (width: number, length: number, position: { x: number; z: number }) => {
            const fieldLineGeometry = new THREE.PlaneGeometry(width, length)
            const fieldLineMaterial = new THREE.MeshStandardMaterial({ color: FIELD_LINE_COLOR })
            const fieldLine = new THREE.Mesh(fieldLineGeometry, fieldLineMaterial)
            fieldLine.rotation.x = -Math.PI / 2
            fieldLine.position.set(position.x, 0.01, position.z)
            fieldLine.receiveShadow = true
            this.scene.add(fieldLine)
        }

        const createQuarterCircle = (position: { x: number; z: number }, rotation: number) => {
            const radius = 1
            const quarterCircleGeometry = new THREE.RingGeometry(radius - FIELD_LINE_THICKNESS / 2, radius + FIELD_LINE_THICKNESS / 2, 32, 1, 0, Math.PI / 2)
            const quarterCircleMaterial = new THREE.MeshStandardMaterial({ color: FIELD_LINE_COLOR })
            const quarterCircle = new THREE.Mesh(quarterCircleGeometry, quarterCircleMaterial)
            quarterCircle.rotation.x = -Math.PI / 2
            quarterCircle.rotation.z = rotation
            quarterCircle.position.set(position.x, 0.01, position.z)
            this.scene.add(quarterCircle)
        }

        const createSpot = (position: { x: number; z: number }) => {
            const centerSpotGeometry = new THREE.CircleGeometry(FIELD_LINE_THICKNESS, 32)
            const centerSpotMaterial = new THREE.MeshStandardMaterial({ color: FIELD_LINE_COLOR })
            const centerSpot = new THREE.Mesh(centerSpotGeometry, centerSpotMaterial)
            centerSpot.rotation.x = -Math.PI / 2
            centerSpot.position.set(position.x, 0.01, position.z)
            this.scene.add(centerSpot)
        }

        const createCornerFlagPole = (position: { x: number; z: number }) => {
            const cornerFlagPole = new THREE.Group()
            const cornerPoleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5)
            const cornerPoleMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
            const cornerPole = new THREE.Mesh(cornerPoleGeometry, cornerPoleMaterial)
            cornerPole.position.set(position.x, 0.75, position.z)
            cornerPole.castShadow = true
            cornerFlagPole.add(cornerPole)
            const cornerFlagGeometry = new THREE.PlaneGeometry(0.4, 0.3)
            const cornerFlagMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide })
            const cornerFlag = new THREE.Mesh(cornerFlagGeometry, cornerFlagMaterial)
            cornerFlag.position.set(position.x - 0.2, 1.7, position.z)
            cornerFlag.castShadow = true
            cornerFlagPole.add(cornerFlag)
            this.scene.add(cornerFlagPole)
        }

        const createGoal = (position: [number, number, number]) => {
            // Goal posts
            const postGeometry = new THREE.CylinderGeometry(FIELD_GOAL_POST_RADIUS, FIELD_GOAL_POST_RADIUS, FIELD_GOAL_HEIGHT, 8)
            const postMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.2 })

            // Left post
            const leftPost = new THREE.Mesh(postGeometry, postMaterial)
            leftPost.position.set(position[0] - FIELD_GOAL_WIDTH / 2, position[1] + FIELD_GOAL_HEIGHT / 2, position[2])
            leftPost.castShadow = true
            leftPost.receiveShadow = true

            // Right post
            const rightPost = new THREE.Mesh(postGeometry, postMaterial)
            rightPost.position.set(position[0] + FIELD_GOAL_WIDTH / 2, position[1] + FIELD_GOAL_HEIGHT / 2, position[2])
            rightPost.castShadow = true
            rightPost.receiveShadow = true

            // Crossbar
            const crossbarGeometry = new THREE.CylinderGeometry(FIELD_GOAL_POST_RADIUS, FIELD_GOAL_POST_RADIUS, FIELD_GOAL_WIDTH, 8)
            const crossbar = new THREE.Mesh(crossbarGeometry, postMaterial)
            crossbar.position.set(position[0], position[1] + FIELD_GOAL_HEIGHT, position[2])
            crossbar.rotation.z = Math.PI / 2
            crossbar.castShadow = true
            crossbar.receiveShadow = true

            this.scene.add(leftPost)
            this.scene.add(rightPost)
            this.scene.add(crossbar)
        }

        createFieldLine(FIELD_WIDTH, FIELD_LINE_THICKNESS, { x: 0, z: halfLength }) // Outer Line North
        createFieldLine(FIELD_WIDTH, FIELD_LINE_THICKNESS, { x: 0, z: -halfLength }) // Outer Line South
        createFieldLine(FIELD_LINE_THICKNESS, FIELD_LENGTH + FIELD_LINE_THICKNESS, { x: -halfWidth, z: 0 }) // Outer Line East
        createFieldLine(FIELD_LINE_THICKNESS, FIELD_LENGTH + FIELD_LINE_THICKNESS, { x: halfWidth, z: 0 }) // Outer Line West
        createFieldLine(FIELD_WIDTH, FIELD_LINE_THICKNESS, { x: 0, z: 0 }) // Center Line

        createQuarterCircle({ x: -halfWidth, z: halfLength }, 0) // Quarter Circle Northeast
        createQuarterCircle({ x: halfWidth, z: halfLength }, Math.PI / 2) // Quarter Circle Northwest
        createQuarterCircle({ x: -halfWidth, z: -halfLength }, -Math.PI / 2) // Quarter Circle Southeast
        createQuarterCircle({ x: halfWidth, z: -halfLength }, Math.PI) // Quarter Circle Southwest

        // Center Circle
        const centerCircleRadius = 9.15 / 2
        const centerCircleGeometry = new THREE.RingGeometry(centerCircleRadius - FIELD_LINE_THICKNESS / 2, centerCircleRadius + FIELD_LINE_THICKNESS / 2, 32)
        const centerCircleMaterial = new THREE.MeshStandardMaterial({ color: FIELD_LINE_COLOR })
        const centerCircle = new THREE.Mesh(centerCircleGeometry, centerCircleMaterial)
        centerCircle.rotation.x = -Math.PI / 2
        centerCircle.position.y = 0.01
        this.scene.add(centerCircle)

        createSpot({ x: 0, z: 0 }) // Center Spot
        createSpot({ x: 0, z: halfLength - 11 }) // Penalty Spot North
        createSpot({ x: 0, z: -halfLength + 11 }) // Penalty Spot South

        // Penalty Area North
        createFieldLine(40.3, FIELD_LINE_THICKNESS, { x: 0, z: halfLength - 16.5 })
        createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, { x: 20.15, z: halfLength - 8.25 })
        createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, { x: -20.15, z: halfLength - 8.25 })
        // Goal Area North
        createFieldLine(18.32, FIELD_LINE_THICKNESS, { x: 0, z: halfLength - 5.5 })
        createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, { x: 9.16, z: halfLength - 2.75 })
        createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, { x: -9.16, z: halfLength - 2.75 })
        // Penalty South
        createFieldLine(40.3, FIELD_LINE_THICKNESS, { x: 0, z: -halfLength + 16.5 })
        createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, { x: 20.15, z: -halfLength + 8.25 })
        createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, { x: -20.15, z: -halfLength + 8.25 })
        // Penalty Box South
        createFieldLine(18.32, FIELD_LINE_THICKNESS, { x: 0, z: -halfLength + 5.5 })
        createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, { x: 9.16, z: -halfLength + 2.75 })
        createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, { x: -9.16, z: -halfLength + 2.75 })

        createCornerFlagPole({ x: halfWidth, z: halfLength }) // Northeast corner
        createCornerFlagPole({ x: -halfWidth, z: halfLength }) // Northwest corner
        createCornerFlagPole({ x: halfWidth, z: -halfLength }) // Southeast corner
        createCornerFlagPole({ x: -halfWidth, z: -halfLength }) // Southwest corner

        createGoal([0, 0, FIELD_LENGTH / 2]) // North Goal
        createGoal([0, 0, -FIELD_LENGTH / 2]) // South Goal
    }

    private createClouds() {
        const createCloud = (x: number, y: number, z: number, baseSize: number) => {
            const cloudGroup = new THREE.Group()
            const cloudMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8
            })

            // Create multiple spheres for each cloud
            const numSpheres = 5 + Math.floor(Math.random() * 3) // Random number between 5-7 spheres
            const spheres = []

            for (let i = 0; i < numSpheres; i++) {
                const size = baseSize * (0.7 + Math.random() * 0.6) // Random size between 70% and 130% of base size
                const sphereGeometry = new THREE.SphereGeometry(size, 8, 8)
                const sphere = new THREE.Mesh(sphereGeometry, cloudMaterial)

                // Random offset from center
                const offsetX = (Math.random() - 0.5) * baseSize * 2
                const offsetY = (Math.random() - 0.5) * baseSize
                const offsetZ = (Math.random() - 0.5) * baseSize * 2

                sphere.position.set(offsetX, offsetY, offsetZ)
                sphere.castShadow = true
                sphere.receiveShadow = true
                spheres.push(sphere)
                cloudGroup.add(sphere)
            }

            cloudGroup.position.set(x, y, z)
            this.scene.add(cloudGroup)
        }

        // Add more clouds with varying sizes and positions
        createCloud(-15, 8, -10, 2)
        createCloud(15, 10, 5, 2.5)
        createCloud(0, 12, -15, 3)
        createCloud(-10, 9, 15, 2.2)
        createCloud(10, 11, -20, 2.8)
        createCloud(-20, 13, 0, 2.3)
        createCloud(20, 9, -25, 2.6)
        createCloud(-5, 11, 25, 2.4)
    }

    private createTrees() {
        const createTree = (x: number, z: number, height: number = 4, crownSize: number = 2.5) => {
            // Thicker trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.6, height, 8)
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
            trunk.position.set(x, height / 2, z)
            trunk.castShadow = true
            trunk.receiveShadow = true

            // Create tree crown using multiple spheres like clouds
            const crownMaterial = new THREE.MeshStandardMaterial({
                color: 0x228b22,
                roughness: 0.8
            })

            // Create multiple overlapping spheres for a fuller look
            const numSpheres = 4 + Math.floor(Math.random() * 3) // 4-6 spheres per crown
            for (let i = 0; i < numSpheres; i++) {
                const size = crownSize * (0.7 + Math.random() * 0.6)
                const sphereGeometry = new THREE.SphereGeometry(size, 8, 8)
                const sphere = new THREE.Mesh(sphereGeometry, crownMaterial)

                // Random offset from center
                const offsetX = (Math.random() - 0.5) * crownSize
                const offsetY = (Math.random() - 0.5) * crownSize * 0.5
                const offsetZ = (Math.random() - 0.5) * crownSize

                sphere.position.set(x + offsetX, height + crownSize + offsetY, z + offsetZ)
                sphere.castShadow = true
                sphere.receiveShadow = true
                this.scene.add(sphere)
            }

            this.scene.add(trunk)
        }

        // Add bigger trees around the field with varied sizes
        createTree(-25, -30, 5, 3)
        createTree(25, -30, 4.5, 2.8)
        createTree(-25, 30, 5.5, 3.2)
        createTree(25, 30, 5, 3)
        createTree(-30, 0, 4.8, 2.9)
        createTree(30, 0, 5.2, 3.1)

        // Add some smaller trees for variety
        createTree(-20, -15, 4, 2.5)
        createTree(20, 15, 3.8, 2.4)
        createTree(-15, 20, 4.2, 2.6)
    }
}
