import * as THREE from 'three'

import {
    FIELD_EXTRA_LENGTH,
    FIELD_EXTRA_WIDTH,
    FIELD_LENGTH,
    FIELD_LINE_COLOR,
    FIELD_LINE_THICKNESS,
    FIELD_WIDTH,
    WALL_HEIGHT,
    WALL_THICKNESS
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
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight)
        // Make camera see all layers
        this.camera.layers.enableAll()

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.shadowMap.enabled = true
        document.body.appendChild(this.renderer.domElement)

        // Create layers
        const LAYER_GENERAL = 0 // Default layer
        const LAYER_DYNAMIC = 1 // Layer for player and ball

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        this.scene.add(ambientLight)

        // Top-down light for player and ball shadows
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

        // Clouds
        this.createClouds()

        // Goals
        this.createGoals()

        // Trees
        this.createTrees()

        // Expose scene, camera, and renderer to window object for game.ts
        ;(window as any).scene = this.scene
        ;(window as any).camera = this.camera
        ;(window as any).renderer = this.renderer
    }

    private createGround() {
        const groundRadius = Math.max(FIELD_WIDTH + FIELD_EXTRA_WIDTH, FIELD_LENGTH + FIELD_EXTRA_LENGTH) * 1.5
        const groundGeometry = new THREE.CircleGeometry(groundRadius, 32)
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x90ee90 }) // Light Green
        const ground = new THREE.Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = -Math.PI / 2
        ground.position.y = -0.1
        ground.receiveShadow = true // Make sure ground receives shadows
        // Ground should receive shadows from both layers
        ground.layers.enable((window as any).LAYER_GENERAL)
        ground.layers.enable((window as any).LAYER_DYNAMIC)
        this.scene.add(ground)
    }

    private createSoccerField() {
        const fieldGeometry = new THREE.PlaneGeometry(FIELD_WIDTH + FIELD_EXTRA_WIDTH, FIELD_LENGTH + FIELD_EXTRA_LENGTH)
        const fieldMaterial = new THREE.MeshStandardMaterial({ color: 0x2e8b57 }) // Forest green
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial)
        field.rotation.x = -Math.PI / 2
        field.receiveShadow = true
        this.scene.add(field)

        // Field Lines
        const createFieldLine = (width: number, length: number, position: [number, number, number], rotation: [number, number, number]) => {
            const lineGeometry = new THREE.PlaneGeometry(width, length)
            const lineMaterial = new THREE.MeshStandardMaterial({ color: FIELD_LINE_COLOR })
            const line = new THREE.Mesh(lineGeometry, lineMaterial)
            line.rotation.set(...rotation)
            line.position.set(...position)
            line.receiveShadow = true
            this.scene.add(line)
        }

        // Outer Line North
        createFieldLine(FIELD_WIDTH, FIELD_LINE_THICKNESS, [0, 0.01, FIELD_LENGTH / 2], [-Math.PI / 2, 0, 0])
        // Outer Line South
        createFieldLine(FIELD_WIDTH, FIELD_LINE_THICKNESS, [0, 0.01, -FIELD_LENGTH / 2], [-Math.PI / 2, 0, 0])
        // Outer Line East
        createFieldLine(FIELD_LINE_THICKNESS, FIELD_LENGTH + FIELD_LINE_THICKNESS, [FIELD_WIDTH / 2, 0.01, 0], [-Math.PI / 2, 0, 0])
        // Outer Line West
        createFieldLine(FIELD_LINE_THICKNESS, FIELD_LENGTH + FIELD_LINE_THICKNESS, [-FIELD_WIDTH / 2, 0.01, 0], [-Math.PI / 2, 0, 0])

        // Center Line
        createFieldLine(FIELD_WIDTH, FIELD_LINE_THICKNESS, [0, 0.01, 0], [-Math.PI / 2, 0, 0])

        // Center Circle
        const centerCircleRadius = 9.15 / 2
        const centerCircleGeometry = new THREE.RingGeometry(centerCircleRadius - FIELD_LINE_THICKNESS / 2, centerCircleRadius + FIELD_LINE_THICKNESS / 2, 32)
        const centerCircleMaterial = new THREE.MeshStandardMaterial({ color: FIELD_LINE_COLOR })
        const centerCircle = new THREE.Mesh(centerCircleGeometry, centerCircleMaterial)
        centerCircle.rotation.x = -Math.PI / 2
        centerCircle.position.y = 0.01
        this.scene.add(centerCircle)

        // Spots
        const createSpot = (x: number, z: number) => {
            const centerSpotGeometry = new THREE.CircleGeometry(FIELD_LINE_THICKNESS, 32)
            const centerSpotMaterial = new THREE.MeshStandardMaterial({ color: FIELD_LINE_COLOR })
            const centerSpot = new THREE.Mesh(centerSpotGeometry, centerSpotMaterial)
            centerSpot.rotation.x = -Math.PI / 2
            centerSpot.position.set(x, 0.01, z)
            this.scene.add(centerSpot)
        }
        // Center Spot
        createSpot(0, 0)
        // Penalty Spot North
        createSpot(0, FIELD_LENGTH / 2 - 11)
        // Penalty Spot South
        createSpot(0, -FIELD_LENGTH / 2 + 11)

        // Penalty Area North
        createFieldLine(40.3, FIELD_LINE_THICKNESS, [0, 0.01, FIELD_LENGTH / 2 - 16.5], [-Math.PI / 2, 0, 0])
        createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, [20.15, 0.01, FIELD_LENGTH / 2 - 8.25], [-Math.PI / 2, 0, 0])
        createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, [-20.15, 0.01, FIELD_LENGTH / 2 - 8.25], [-Math.PI / 2, 0, 0])
        // Goal Area North
        createFieldLine(18.32, FIELD_LINE_THICKNESS, [0, 0.01, FIELD_LENGTH / 2 - 5.5], [-Math.PI / 2, 0, 0])
        createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, [9.16, 0.01, FIELD_LENGTH / 2 - 2.75], [-Math.PI / 2, 0, 0])
        createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, [-9.16, 0.01, FIELD_LENGTH / 2 - 2.75], [-Math.PI / 2, 0, 0])
        // Penalty South
        createFieldLine(40.3, FIELD_LINE_THICKNESS, [0, 0.01, -FIELD_LENGTH / 2 + 16.5], [-Math.PI / 2, 0, 0])
        createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, [20.15, 0.01, -FIELD_LENGTH / 2 + 8.25], [-Math.PI / 2, 0, 0])
        createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, [-20.15, 0.01, -FIELD_LENGTH / 2 + 8.25], [-Math.PI / 2, 0, 0])
        // Penalty Box South
        createFieldLine(18.32, FIELD_LINE_THICKNESS, [0, 0.01, -FIELD_LENGTH / 2 + 5.5], [-Math.PI / 2, 0, 0])
        createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, [9.16, 0.01, -FIELD_LENGTH / 2 + 2.75], [-Math.PI / 2, 0, 0])
        createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, [-9.16, 0.01, -FIELD_LENGTH / 2 + 2.75], [-Math.PI / 2, 0, 0])

        // Walls
        const outerWidth = FIELD_WIDTH + WALL_THICKNESS
        const outerLength = FIELD_LENGTH + WALL_THICKNESS * 2

        // Create outer box (larger)
        const outerGeometry = new THREE.BoxGeometry(outerWidth, WALL_HEIGHT, outerLength)
        const outerMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })
        const outerBox = new THREE.Mesh(outerGeometry, outerMaterial)
        outerBox.position.y = WALL_HEIGHT / 2
        outerBox.castShadow = true
        outerBox.receiveShadow = true
        // this.scene.add(outerBox)

        // Create inner box (smaller)
        const innerGeometry = new THREE.BoxGeometry(FIELD_WIDTH, WALL_HEIGHT + 0.1, FIELD_LENGTH)
        const innerMaterial = new THREE.MeshStandardMaterial({
            color: 0x2e8b57, // Same color as the field
            side: THREE.DoubleSide
        })
        const innerBox = new THREE.Mesh(innerGeometry, innerMaterial)
        innerBox.position.y = WALL_HEIGHT / 2
        innerBox.castShadow = true
        innerBox.receiveShadow = true
        // this.scene.add(innerBox)

        // Add wireframe edges to the outer box
        const wireframeGeometry = new THREE.EdgesGeometry(outerGeometry)
        const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 })
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
        wireframe.position.y = WALL_HEIGHT / 2
        this.scene.add(wireframe)

        // Add wireframe edges to the inner box
        const innerWireframeGeometry = new THREE.EdgesGeometry(innerGeometry)
        const innerWireframe = new THREE.LineSegments(innerWireframeGeometry, wireframeMaterial)
        innerWireframe.position.y = WALL_HEIGHT / 2
        // this.scene.add(innerWireframe)
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

    private createGoals() {
        const goalWidth = 4
        const goalHeight = 2
        const goalDepth = 2
        const goalPostRadius = 0.1
        const goalNetColor = 0xffffff
        const fieldLength = 30

        const createGoal = (position: [number, number, number]) => {
            // Goal posts
            const postGeometry = new THREE.CylinderGeometry(goalPostRadius, goalPostRadius, goalHeight, 8)
            const postMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.5,
                roughness: 0.2
            })

            // Left post
            const leftPost = new THREE.Mesh(postGeometry, postMaterial)
            leftPost.position.set(position[0] - goalWidth / 2, position[1] + goalHeight / 2, position[2])
            leftPost.castShadow = true
            leftPost.receiveShadow = true

            // Right post
            const rightPost = new THREE.Mesh(postGeometry, postMaterial)
            rightPost.position.set(position[0] + goalWidth / 2, position[1] + goalHeight / 2, position[2])
            rightPost.castShadow = true
            rightPost.receiveShadow = true

            // Crossbar
            const crossbarGeometry = new THREE.CylinderGeometry(goalPostRadius, goalPostRadius, goalWidth, 8)
            const crossbar = new THREE.Mesh(crossbarGeometry, postMaterial)
            crossbar.position.set(position[0], position[1] + goalHeight, position[2])
            crossbar.rotation.z = Math.PI / 2
            crossbar.castShadow = true
            crossbar.receiveShadow = true

            // Goal net (simplified)
            const netGeometry = new THREE.BoxGeometry(goalWidth, goalHeight, goalDepth)
            const netMaterial = new THREE.MeshStandardMaterial({
                color: goalNetColor,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            })
            const net = new THREE.Mesh(netGeometry, netMaterial)
            net.position.set(position[0], position[1] + goalHeight / 2, position[2] + goalDepth / 2)
            net.castShadow = true
            net.receiveShadow = true

            this.scene.add(leftPost)
            this.scene.add(rightPost)
            this.scene.add(crossbar)
            this.scene.add(net)
        }

        // Create goals
        const goalPositions = [
            { position: [0, 0, fieldLength / 2 - goalDepth / 2] as [number, number, number] }, // North goal
            { position: [0, 0, -fieldLength / 2 + goalDepth / 2] as [number, number, number] } // South goal
        ]

        goalPositions.forEach(({ position }) => {
            createGoal(position)
        })
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
