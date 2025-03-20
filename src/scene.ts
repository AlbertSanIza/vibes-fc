import {
    AmbientLight,
    AxesHelper,
    CircleGeometry,
    Color,
    CylinderGeometry,
    DirectionalLight,
    DoubleSide,
    Group,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    RingGeometry,
    SphereGeometry,
    Scene as TScene,
    WebGLRenderer
} from 'three'

import {
    FIELD_EXTENDED_LENGTH,
    FIELD_EXTENDED_LENGTH_HALF,
    FIELD_EXTENDED_WIDTH,
    FIELD_EXTENDED_WIDTH_HALF,
    FIELD_GOAL_HEIGHT,
    FIELD_GOAL_POST_RADIUS,
    FIELD_GOAL_WIDTH,
    FIELD_LENGTH,
    FIELD_LENGTH_HALF,
    FIELD_LINE_COLOR,
    FIELD_LINE_THICKNESS,
    FIELD_WIDTH,
    FIELD_WIDTH_HALF
} from './constants'

export class Scene {
    scene: TScene
    camera: PerspectiveCamera
    renderer: WebGLRenderer

    constructor() {
        // Scene
        this.scene = new TScene()
        this.scene.background = new Color(0x87ceeb) // Sky blue background

        // Axes Helper
        const axesHelper = new AxesHelper(20) // Size 5 units
        this.scene.add(axesHelper)

        // Camera
        this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight)
        this.camera.layers.enableAll()

        // Renderer
        this.renderer = new WebGLRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.shadowMap.enabled = true
        document.body.appendChild(this.renderer.domElement)

        // Global Lighting
        const ambientLight = new AmbientLight()
        this.scene.add(ambientLight)

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

        const createAngleLight = (position: { x: number; y: number; z: number }) => {
            const angledLight = new DirectionalLight()
            angledLight.position.set(position.x, position.y, position.z)
            angledLight.castShadow = true
            angledLight.shadow.mapSize.width = 1000
            angledLight.shadow.mapSize.height = 1000
            angledLight.shadow.camera.near = 0.5
            angledLight.shadow.camera.far = 100
            angledLight.shadow.camera.left = -FIELD_EXTENDED_WIDTH_HALF * 1.5
            angledLight.shadow.camera.right = FIELD_EXTENDED_WIDTH_HALF * 1.5
            angledLight.shadow.camera.top = FIELD_EXTENDED_LENGTH_HALF * 1.5
            angledLight.shadow.camera.bottom = -FIELD_EXTENDED_LENGTH_HALF * 1.5
            this.scene.add(angledLight)
            // Add helper to visualize shadow camera frustum (for debugging)
            // const shadowCameraHelper = new CameraHelper(angledLight.shadow.camera)
            // this.scene.add(shadowCameraHelper)
        }

        createAngleLight({ x: FIELD_EXTENDED_WIDTH_HALF, y: 0, z: FIELD_EXTENDED_LENGTH_HALF }) // Northeast

        // Elements
        this.createGround()
        this.createSoccerField()
        this.createTrees()
        this.createClouds()
    }

    private createGround() {
        const groundGeometry = new CircleGeometry(Math.max(FIELD_EXTENDED_WIDTH, FIELD_EXTENDED_LENGTH) * 1.5, 32)
        const groundMaterial = new MeshStandardMaterial({ color: 0x90ee90 }) // Light Green
        const ground = new Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = -Math.PI / 2
        ground.position.y = -0.1
        ground.receiveShadow = true

        this.scene.add(ground)
    }

    private createSoccerField() {
        // North: Positive Z
        // South: Negative Z
        // East: Negative X
        // West: Positive X

        // Main Field
        const mainFieldGeometry = new PlaneGeometry(FIELD_EXTENDED_WIDTH, FIELD_EXTENDED_LENGTH)
        const mainFieldMaterial = new MeshStandardMaterial({ color: 0x2e8b57 }) // Forest green
        const mainField = new Mesh(mainFieldGeometry, mainFieldMaterial)
        mainField.rotation.x = -Math.PI / 2
        mainField.receiveShadow = true
        this.scene.add(mainField)

        const createFieldLine = (width: number, length: number, position: { x: number; z: number }) => {
            const fieldLineGeometry = new PlaneGeometry(width, length)
            const fieldLineMaterial = new MeshStandardMaterial({ color: FIELD_LINE_COLOR })
            const fieldLine = new Mesh(fieldLineGeometry, fieldLineMaterial)
            fieldLine.rotation.x = -Math.PI / 2
            fieldLine.position.set(position.x, 0.01, position.z)
            fieldLine.receiveShadow = true
            this.scene.add(fieldLine)
        }

        const createQuarterCircle = (position: { x: number; z: number }, rotation: number) => {
            const radius = 1
            const quarterCircleGeometry = new RingGeometry(radius - FIELD_LINE_THICKNESS / 2, radius + FIELD_LINE_THICKNESS / 2, 32, 1, 0, Math.PI / 2)
            const quarterCircleMaterial = new MeshStandardMaterial({ color: FIELD_LINE_COLOR })
            const quarterCircle = new Mesh(quarterCircleGeometry, quarterCircleMaterial)
            quarterCircle.rotation.x = -Math.PI / 2
            quarterCircle.rotation.z = rotation
            quarterCircle.position.set(position.x, 0.01, position.z)
            this.scene.add(quarterCircle)
        }

        const createSpot = (position: { x: number; z: number }) => {
            const centerSpotGeometry = new CircleGeometry(FIELD_LINE_THICKNESS, 32)
            const centerSpotMaterial = new MeshStandardMaterial({ color: FIELD_LINE_COLOR })
            const centerSpot = new Mesh(centerSpotGeometry, centerSpotMaterial)
            centerSpot.rotation.x = -Math.PI / 2
            centerSpot.position.set(position.x, 0.01, position.z)
            this.scene.add(centerSpot)
        }

        const createCornerFlagPole = (position: { x: number; z: number }) => {
            const cornerFlagPole = new Group()
            const cornerPoleGeometry = new CylinderGeometry(0.05, 0.05, 1.5)
            const cornerPoleMaterial = new MeshStandardMaterial({ color: 0xffffff })
            const cornerPole = new Mesh(cornerPoleGeometry, cornerPoleMaterial)
            cornerPole.position.set(position.x, 0.75, position.z)
            cornerPole.castShadow = true
            cornerFlagPole.add(cornerPole)
            const cornerFlagGeometry = new PlaneGeometry(0.4, 0.3)
            const cornerFlagMaterial = new MeshStandardMaterial({ color: 0xff0000, side: DoubleSide })
            const cornerFlag = new Mesh(cornerFlagGeometry, cornerFlagMaterial)
            cornerFlag.position.set(position.x - 0.2, 1.7, position.z)
            cornerFlag.castShadow = true
            cornerFlagPole.add(cornerFlag)
            this.scene.add(cornerFlagPole)
        }

        const createGoal = (position: [number, number, number]) => {
            // Goal posts
            const postGeometry = new CylinderGeometry(FIELD_GOAL_POST_RADIUS, FIELD_GOAL_POST_RADIUS, FIELD_GOAL_HEIGHT, 8)
            const postMaterial = new MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.2 })

            // Left post
            const leftPost = new Mesh(postGeometry, postMaterial)
            leftPost.position.set(position[0] - FIELD_GOAL_WIDTH / 2, position[1] + FIELD_GOAL_HEIGHT / 2, position[2])
            leftPost.castShadow = true
            leftPost.receiveShadow = true

            // Right post
            const rightPost = new Mesh(postGeometry, postMaterial)
            rightPost.position.set(position[0] + FIELD_GOAL_WIDTH / 2, position[1] + FIELD_GOAL_HEIGHT / 2, position[2])
            rightPost.castShadow = true
            rightPost.receiveShadow = true

            // Crossbar
            const crossbarGeometry = new CylinderGeometry(FIELD_GOAL_POST_RADIUS, FIELD_GOAL_POST_RADIUS, FIELD_GOAL_WIDTH, 8)
            const crossbar = new Mesh(crossbarGeometry, postMaterial)
            crossbar.position.set(position[0], position[1] + FIELD_GOAL_HEIGHT, position[2])
            crossbar.rotation.z = Math.PI / 2
            crossbar.castShadow = true
            crossbar.receiveShadow = true

            this.scene.add(leftPost)
            this.scene.add(rightPost)
            this.scene.add(crossbar)
        }

        createFieldLine(FIELD_WIDTH, FIELD_LINE_THICKNESS, { x: 0, z: FIELD_LENGTH_HALF }) // Outer Line North
        createFieldLine(FIELD_WIDTH, FIELD_LINE_THICKNESS, { x: 0, z: -FIELD_LENGTH_HALF }) // Outer Line South
        createFieldLine(FIELD_LINE_THICKNESS, FIELD_LENGTH + FIELD_LINE_THICKNESS, { x: -FIELD_WIDTH_HALF, z: 0 }) // Outer Line East
        createFieldLine(FIELD_LINE_THICKNESS, FIELD_LENGTH + FIELD_LINE_THICKNESS, { x: FIELD_WIDTH_HALF, z: 0 }) // Outer Line West
        createFieldLine(FIELD_WIDTH, FIELD_LINE_THICKNESS, { x: 0, z: 0 }) // Center Line

        createQuarterCircle({ x: -FIELD_WIDTH_HALF, z: FIELD_LENGTH_HALF }, 0) // Quarter Circle Northeast
        createQuarterCircle({ x: FIELD_WIDTH_HALF, z: FIELD_LENGTH_HALF }, Math.PI / 2) // Quarter Circle Northwest
        createQuarterCircle({ x: -FIELD_WIDTH_HALF, z: -FIELD_LENGTH_HALF }, -Math.PI / 2) // Quarter Circle Southeast
        createQuarterCircle({ x: FIELD_WIDTH_HALF, z: -FIELD_LENGTH_HALF }, Math.PI) // Quarter Circle Southwest

        // Center Circle
        const centerCircleRadius = 9.15 / 2
        const centerCircleGeometry = new RingGeometry(centerCircleRadius - FIELD_LINE_THICKNESS / 2, centerCircleRadius + FIELD_LINE_THICKNESS / 2, 32)
        const centerCircleMaterial = new MeshStandardMaterial({ color: FIELD_LINE_COLOR })
        const centerCircle = new Mesh(centerCircleGeometry, centerCircleMaterial)
        centerCircle.rotation.x = -Math.PI / 2
        centerCircle.position.y = 0.01
        this.scene.add(centerCircle)

        createSpot({ x: 0, z: 0 }) // Center Spot
        createSpot({ x: 0, z: FIELD_LENGTH_HALF - 11 }) // Penalty Spot North
        createSpot({ x: 0, z: -FIELD_LENGTH_HALF + 11 }) // Penalty Spot South

        // Penalty Area North
        createFieldLine(40.3, FIELD_LINE_THICKNESS, { x: 0, z: FIELD_LENGTH_HALF - 16.5 })
        createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, { x: 20.15, z: FIELD_LENGTH_HALF - 8.25 })
        createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, { x: -20.15, z: FIELD_LENGTH_HALF - 8.25 })
        // Goal Area North
        createFieldLine(18.32, FIELD_LINE_THICKNESS, { x: 0, z: FIELD_LENGTH_HALF - 5.5 })
        createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, { x: 9.16, z: FIELD_LENGTH_HALF - 2.75 })
        createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, { x: -9.16, z: FIELD_LENGTH_HALF - 2.75 })
        // Penalty South
        createFieldLine(40.3, FIELD_LINE_THICKNESS, { x: 0, z: -FIELD_LENGTH_HALF + 16.5 })
        createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, { x: 20.15, z: -FIELD_LENGTH_HALF + 8.25 })
        createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, { x: -20.15, z: -FIELD_LENGTH_HALF + 8.25 })
        // Penalty Box South
        createFieldLine(18.32, FIELD_LINE_THICKNESS, { x: 0, z: -FIELD_LENGTH_HALF + 5.5 })
        createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, { x: 9.16, z: -FIELD_LENGTH_HALF + 2.75 })
        createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, { x: -9.16, z: -FIELD_LENGTH_HALF + 2.75 })

        createCornerFlagPole({ x: FIELD_WIDTH_HALF, z: FIELD_LENGTH_HALF }) // Northeast corner
        createCornerFlagPole({ x: -FIELD_WIDTH_HALF, z: FIELD_LENGTH_HALF }) // Northwest corner
        createCornerFlagPole({ x: FIELD_WIDTH_HALF, z: -FIELD_LENGTH_HALF }) // Southeast corner
        createCornerFlagPole({ x: -FIELD_WIDTH_HALF, z: -FIELD_LENGTH_HALF }) // Southwest corner

        createGoal([0, 0, FIELD_LENGTH / 2]) // North Goal
        createGoal([0, 0, -FIELD_LENGTH / 2]) // South Goal
    }

    private createClouds() {
        const createCloud = (x: number, y: number, z: number, baseSize: number) => {
            const cloudGroup = new Group()
            const cloudMaterial = new MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })

            // Create multiple spheres for each cloud
            const numSpheres = 5 + Math.floor(Math.random() * 3) // Random number between 5-7 spheres
            const spheres = []

            for (let i = 0; i < numSpheres; i++) {
                const size = baseSize * (0.7 + Math.random() * 0.6) // Random size between 70% and 130% of base size
                const sphereGeometry = new SphereGeometry(size, 8, 8)
                const sphere = new Mesh(sphereGeometry, cloudMaterial)

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
        createCloud(-15, 10, -10, 2)
        createCloud(15, 12, 5, 2.5)
        createCloud(0, 14, -15, 3)
        createCloud(-10, 11, 15, 2.2)
        createCloud(10, 13, -20, 2.8)
        createCloud(-20, 15, 0, 2.3)
        createCloud(20, 10, -25, 2.6)
        createCloud(-5, 13, 25, 2.4)
    }

    private createTrees() {
        const createTree = (position: { x: number; z: number }, height: number = 4, crownSize: number = 2.5) => {
            const tree = new Group()
            // Trunk
            const trunkGeometry = new CylinderGeometry(0.4, 0.6, height, 5)
            const trunkMaterial = new MeshStandardMaterial({ color: 0x8b4513 }) // Saddle Brown
            const trunk = new Mesh(trunkGeometry, trunkMaterial)
            trunk.position.set(position.x, height / 2, position.z)
            tree.add(trunk)

            // Crown
            const crownMaterial = new MeshStandardMaterial({ color: 0x228b22, roughness: 0.8 })
            for (let i = 0; i < 4 + Math.floor(Math.random() * 3); i++) {
                const sphereGeometry = new SphereGeometry(crownSize * (0.7 + Math.random() * 0.6), 8, 8)
                const sphere = new Mesh(sphereGeometry, crownMaterial)
                const offsetX = (Math.random() - 0.5) * crownSize
                const offsetY = (Math.random() - 0.5) * crownSize * 0.5
                const offsetZ = (Math.random() - 0.5) * crownSize
                sphere.position.set(position.x + offsetX, height + crownSize + offsetY, position.z + offsetZ)
                sphere.castShadow = true
                tree.add(sphere)
            }

            this.scene.add(tree)
        }

        const groundRadius = Math.max(FIELD_EXTENDED_WIDTH, FIELD_EXTENDED_LENGTH) * 1.2

        // Add trees randomly within the ground circle but outside the extended field
        for (let i = 0; i < 200; i++) {
            // Generate random angle and radius in polar coordinates
            const angle = Math.random() * Math.PI * 2
            const minRadius = Math.max(FIELD_EXTENDED_WIDTH / 2, FIELD_EXTENDED_LENGTH / 2) * 1.2
            const maxRadius = groundRadius * 0.9 // 10% buffer from edge
            const radius = minRadius + Math.random() * (maxRadius - minRadius)
            // Convert to Cartesian coordinates
            const x = radius * Math.cos(angle)
            const z = radius * Math.sin(angle)
            createTree({ x, z }, 3 + Math.random() * 3, 2 + Math.random() * 2)
        }
    }
}
