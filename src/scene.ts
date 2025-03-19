import * as THREE from 'three'

import { FIELD_WIDTH, FIELD_LENGTH, FIELD_LINE_WIDTH, FIELD_LINE_COLOR, WALL_HEIGHT } from './constants'

export class Scene {
    public scene: THREE.Scene
    public camera: THREE.PerspectiveCamera
    public renderer: THREE.WebGLRenderer

    constructor() {
        // Scene setup
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0x87ceeb) // Sky blue background

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight)

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        // this.renderer.shadowMap.enabled = true
        document.body.appendChild(this.renderer.domElement)

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        this.scene.add(ambientLight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(5, 5, 5)
        directionalLight.castShadow = true
        this.scene.add(directionalLight)

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
        const groundRadius = Math.max(FIELD_WIDTH, FIELD_LENGTH) * 1.5
        const groundGeometry = new THREE.CircleGeometry(groundRadius, 32)
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x90ee90 }) // Light Green
        const ground = new THREE.Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = -Math.PI / 2
        ground.position.y = -0.1
        this.scene.add(ground)
    }

    private createSoccerField() {
        const fieldGeometry = new THREE.PlaneGeometry(FIELD_WIDTH, FIELD_LENGTH)
        const fieldMaterial = new THREE.MeshStandardMaterial({ color: 0x2e8b57 }) // Forest green
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial)
        field.rotation.x = -Math.PI / 2
        field.receiveShadow = true
        this.scene.add(field)

        // Field lines
        const createFieldLine = (width: number, length: number, position: [number, number, number], rotation: [number, number, number]) => {
            const lineGeometry = new THREE.PlaneGeometry(width, length)
            const lineMaterial = new THREE.MeshStandardMaterial({ color: FIELD_LINE_COLOR })
            const line = new THREE.Mesh(lineGeometry, lineMaterial)
            line.position.set(...position)
            line.rotation.set(...rotation)
            this.scene.add(line)
        }

        // Center line
        createFieldLine(FIELD_WIDTH, FIELD_LINE_WIDTH, [0, 0.01, 0], [-Math.PI / 2, 0, 0])

        // Center circle
        const centerCircleRadius = 9.15 / 2
        const centerCircleGeometry = new THREE.RingGeometry(centerCircleRadius - FIELD_LINE_WIDTH / 2, centerCircleRadius + FIELD_LINE_WIDTH / 2, 32)
        const centerCircleMaterial = new THREE.MeshStandardMaterial({ color: FIELD_LINE_COLOR })
        const centerCircle = new THREE.Mesh(centerCircleGeometry, centerCircleMaterial)
        centerCircle.rotation.x = -Math.PI / 2
        centerCircle.position.y = 0.01
        this.scene.add(centerCircle)

        // Center spot
        const centerSpotGeometry = new THREE.CircleGeometry(FIELD_LINE_WIDTH, 32)
        const centerSpotMaterial = new THREE.MeshStandardMaterial({ color: FIELD_LINE_COLOR })
        const centerSpot = new THREE.Mesh(centerSpotGeometry, centerSpotMaterial)
        centerSpot.rotation.x = -Math.PI / 2
        centerSpot.position.y = 0.01
        this.scene.add(centerSpot)

        // Penalty areas
        const penaltyAreaWidth = 8
        const penaltyAreaLength = 4
        const penaltyAreaPositions = [
            {
                position: [0, 0.01, FIELD_LENGTH / 2 - penaltyAreaLength / 2] as [number, number, number],
                rotation: [-Math.PI / 2, 0, 0] as [number, number, number]
            },
            {
                position: [0, 0.01, -FIELD_LENGTH / 2 + penaltyAreaLength / 2] as [number, number, number],
                rotation: [-Math.PI / 2, 0, 0] as [number, number, number]
            }
        ]

        penaltyAreaPositions.forEach(({ position, rotation }) => {
            createFieldLine(penaltyAreaWidth, FIELD_LINE_WIDTH, position, rotation)
            createFieldLine(FIELD_LINE_WIDTH, penaltyAreaLength, position, rotation)
        })

        // Walls
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        })
        const walls = []

        // Create walls
        const wallPositions = [
            {
                position: [0, WALL_HEIGHT / 2, FIELD_LENGTH / 2] as [number, number, number],
                rotation: [0, 0, 0] as [number, number, number],
                size: [FIELD_WIDTH, WALL_HEIGHT, 1] as [number, number, number]
            }, // North
            {
                position: [0, WALL_HEIGHT / 2, -FIELD_LENGTH / 2] as [number, number, number],
                rotation: [0, Math.PI, 0] as [number, number, number],
                size: [FIELD_WIDTH, WALL_HEIGHT, 1] as [number, number, number]
            }, // South
            {
                position: [FIELD_WIDTH / 2, WALL_HEIGHT / 2, 0] as [number, number, number],
                rotation: [0, Math.PI / 2, 0] as [number, number, number],
                size: [FIELD_LENGTH, WALL_HEIGHT, 1] as [number, number, number]
            }, // East
            {
                position: [-FIELD_WIDTH / 2, WALL_HEIGHT / 2, 0] as [number, number, number],
                rotation: [0, -Math.PI / 2, 0] as [number, number, number],
                size: [FIELD_LENGTH, WALL_HEIGHT, 1] as [number, number, number]
            } // West
        ]

        wallPositions.forEach(({ position, rotation, size }) => {
            const wallGeometry = new THREE.BoxGeometry(...size)
            const wall = new THREE.Mesh(wallGeometry, wallMaterial)
            wall.position.set(...position)
            wall.rotation.set(...rotation)
            wall.castShadow = true
            wall.receiveShadow = true
            walls.push(wall)
            this.scene.add(wall)

            // Add wireframe edges
            const wireframeGeometry = new THREE.EdgesGeometry(wallGeometry)
            const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 })
            const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
            wireframe.position.set(...position)
            wireframe.rotation.set(...rotation)
            this.scene.add(wireframe)
        })
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
        const createTree = (x: number, z: number, height: number = 2, crownSize: number = 1) => {
            const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, height, 8)
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
            trunk.position.set(x, height / 2, z)
            trunk.castShadow = true
            trunk.receiveShadow = true

            const crownGeometry = new THREE.ConeGeometry(crownSize, crownSize * 2, 8)
            const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 })
            const crown = new THREE.Mesh(crownGeometry, crownMaterial)
            crown.position.set(x, height + crownSize, z)
            crown.castShadow = true
            crown.receiveShadow = true

            this.scene.add(trunk)
            this.scene.add(crown)
        }

        // Add trees around the field
        createTree(-15, -20, 2.5, 1.2)
        createTree(15, -20, 2.2, 1)
        createTree(-15, 20, 2.8, 1.3)
        createTree(15, 20, 2.4, 1.1)
        createTree(-20, 0, 2.6, 1.2)
        createTree(20, 0, 2.3, 1)
    }
}
