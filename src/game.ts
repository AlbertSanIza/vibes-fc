import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import {
    BALL_BOUNCE,
    BALL_FRICTION,
    BALL_PUSH_STRENGTH,
    BALL_RADIUS,
    BALL_SHININESS,
    CAMERA_DISTANCE,
    FIELD_EXTENDED_LENGTH,
    FIELD_EXTENDED_WIDTH,
    FIELD_LENGTH,
    FIELD_WIDTH,
    PLAYER_BODY_HEIGHT,
    PLAYER_BODY_RADIUS,
    PLAYER_COLOR,
    PLAYER_GRAVITY,
    PLAYER_GROUND_LEVEL,
    PLAYER_JUMP_FORCE,
    PLAYER_MOVE_SPEED,
    PLAYER_ROTATION_SPEED,
    PLAYER_SHININESS
} from './constants'

export class Game {
    private scene: THREE.Scene
    private camera: THREE.PerspectiveCamera
    private renderer: THREE.WebGLRenderer
    private player!: THREE.Group
    private ball!: THREE.Mesh
    private stats: Stats = new Stats()
    private moveSpeed: number = PLAYER_MOVE_SPEED
    private cameraDistance: number = CAMERA_DISTANCE
    private playerRotation: number = 0
    private rotationSpeed: number = PLAYER_ROTATION_SPEED
    private isDragging: boolean = false
    private previousMousePosition: { x: number; y: number } = { x: 0, y: 0 }
    private keys: { [key: string]: boolean } = {}
    private lastTime: number = 0
    private isJumping: boolean = false
    private jumpVelocity: number = 0
    private jumpForce: number = PLAYER_JUMP_FORCE
    private gravity: number = PLAYER_GRAVITY
    private ballVelocity: THREE.Vector3 = new THREE.Vector3()
    private ballFriction: number = BALL_FRICTION
    private ballBounce: number = BALL_BOUNCE
    private ballRadius: number = BALL_RADIUS
    private pushStrength: number = BALL_PUSH_STRENGTH
    private cameraHeight: number = 5
    private minCameraDistance: number = 5
    private maxCameraDistance: number = 15
    private minCameraHeight: number = 5
    private maxCameraHeight: number = 15

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer

        // Initialize stats
        document.body.appendChild(this.stats.dom)

        // Main Body
        const playerGroup = new THREE.Group()
        const playerBodyGeometry = new THREE.CylinderGeometry(PLAYER_BODY_RADIUS, PLAYER_BODY_RADIUS, PLAYER_BODY_HEIGHT - PLAYER_BODY_RADIUS * 2, 32)
        const playerBodyMaterial = new THREE.MeshPhongMaterial({ color: PLAYER_COLOR, shininess: PLAYER_SHININESS })
        const playerBody = new THREE.Mesh(playerBodyGeometry, playerBodyMaterial)
        playerBody.position.y = PLAYER_BODY_HEIGHT / 2

        playerGroup.add(playerBody)

        // Bottom Body Hemisphere
        const playerBottomGeometry = new THREE.SphereGeometry(PLAYER_BODY_RADIUS, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI)
        const playerBottom = new THREE.Mesh(playerBottomGeometry, playerBodyMaterial)
        playerBottom.position.y = PLAYER_BODY_RADIUS
        playerBottom.castShadow = true
        playerGroup.add(playerBottom)

        // Top Body Hemisphere
        const playerTopGeometry = new THREE.SphereGeometry(PLAYER_BODY_RADIUS, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2)
        const playerTop = new THREE.Mesh(playerTopGeometry, playerBodyMaterial)
        playerTop.position.y = PLAYER_BODY_HEIGHT - PLAYER_BODY_RADIUS
        playerGroup.add(playerTop)

        // Add direction indicator triangle
        const triangleShape = new THREE.Shape()
        triangleShape.moveTo(0, 0.3)
        triangleShape.lineTo(0.3, 0)
        triangleShape.lineTo(-0.3, 0)
        triangleShape.lineTo(0, 0.3)
        const triangleGeometry = new THREE.ShapeGeometry(triangleShape)
        const triangleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }) // Yellow color
        const triangle = new THREE.Mesh(triangleGeometry, triangleMaterial)
        triangle.rotation.x = -Math.PI / 2
        triangle.position.set(0, 0.1, -PLAYER_BODY_RADIUS * 2)
        triangle.layers.set((window as any).LAYER_DYNAMIC)
        playerGroup.add(triangle)

        // Add the group to the scene
        this.player = playerGroup
        this.player.position.set(0, PLAYER_GROUND_LEVEL, 0)
        this.scene.add(this.player)

        // Create ball
        const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32)

        // Load soccer ball texture
        const textureLoader = new THREE.TextureLoader()
        const ballTexture = textureLoader.load('/vibes-fc/ball.jpg')
        ballTexture.wrapS = THREE.RepeatWrapping
        ballTexture.wrapT = THREE.RepeatWrapping
        ballTexture.repeat.set(1, 1)

        // Create ball material with the loaded texture
        const ballMaterial = new THREE.MeshPhongMaterial({
            map: ballTexture,
            shininess: BALL_SHININESS,
            bumpMap: ballTexture,
            bumpScale: 0.01
        })

        this.ball = new THREE.Mesh(ballGeometry, ballMaterial)
        this.ball.castShadow = true
        this.ball.receiveShadow = true
        this.ball.position.set(2, BALL_RADIUS, 0)
        this.ball.layers.set((window as any).LAYER_DYNAMIC)
        this.scene.add(this.ball)

        // Event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this))
        window.addEventListener('keyup', this.handleKeyUp.bind(this))
        window.addEventListener('wheel', this.handleWheel.bind(this))
        window.addEventListener('mousedown', this.handleMouseDown.bind(this))
        window.addEventListener('mousemove', this.handleMouseMove.bind(this))
        window.addEventListener('mouseup', this.handleMouseUp.bind(this))
        window.addEventListener('resize', this.handleResize.bind(this))

        // Start animation loop
        this.lastTime = performance.now()
        this.animate()
    }

    private handleKeyDown(event: KeyboardEvent) {
        this.keys[event.key] = true
        if (event.key === ' ' && !this.isJumping) {
            this.jumpVelocity = this.jumpForce
            this.isJumping = true
        }
    }

    private handleKeyUp(event: KeyboardEvent) {
        this.keys[event.key] = false
    }

    private updateBall(deltaTime: number) {
        // Apply friction to slow down the ball
        this.ballVelocity.multiplyScalar(this.ballFriction)

        // Update ball position based on velocity
        this.ball.position.add(this.ballVelocity.clone().multiplyScalar(deltaTime))

        // Add ball rotation based on movement
        const rotationAxis = new THREE.Vector3(this.ballVelocity.z, 0, -this.ballVelocity.x).normalize()
        const rotationAngle = this.ballVelocity.length() * (deltaTime * 2) // Adjust the multiplier to control rotation speed
        if (rotationAxis.length() > 0.001) {
            // Check if the axis is not effectively zero
            this.ball.rotateOnWorldAxis(rotationAxis, rotationAngle)
        }

        // Check for collision with ground
        if (this.ball.position.y <= this.ballRadius) {
            this.ball.position.y = this.ballRadius
            this.ballVelocity.y = -this.ballVelocity.y * this.ballBounce
        } else {
            // Apply gravity
            this.ballVelocity.y -= this.gravity * deltaTime
        }

        // Check for collision with field boundaries (not walls)
        const fieldBoundaryX = FIELD_WIDTH / 2 - this.ballRadius
        const fieldBoundaryZ = FIELD_LENGTH / 2 - this.ballRadius

        // X-axis boundaries (width)
        if (Math.abs(this.ball.position.x) > fieldBoundaryX) {
            this.ball.position.x = Math.sign(this.ball.position.x) * fieldBoundaryX
            this.ballVelocity.x *= -this.ballBounce
        }

        // Z-axis boundaries (length)
        if (Math.abs(this.ball.position.z) > fieldBoundaryZ) {
            this.ball.position.z = Math.sign(this.ball.position.z) * fieldBoundaryZ
            this.ballVelocity.z *= -this.ballBounce
        }

        // Check for collision with player
        const playerToBall = this.ball.position.clone().sub(this.player.position)
        const distance = playerToBall.length()

        // Change from hardcoded 1 to PLAYER_BODY_RADIUS + this.ballRadius
        const collisionDistance = PLAYER_BODY_RADIUS + this.ballRadius
        if (distance < collisionDistance) {
            // Collision response
            playerToBall.normalize()
            const overlap = (collisionDistance - distance) * 0.5
            this.ball.position.add(playerToBall.clone().multiplyScalar(overlap))
            this.player.position.sub(playerToBall.clone().multiplyScalar(overlap))

            // Transfer momentum from player to ball
            const playerVelocity = new THREE.Vector3()
            if (this.keys['ArrowUp']) {
                playerVelocity.x -= Math.sin(this.player.rotation.y) * this.moveSpeed
                playerVelocity.z -= Math.cos(this.player.rotation.y) * this.moveSpeed
            }
            if (this.keys['ArrowDown']) {
                playerVelocity.x += Math.sin(this.player.rotation.y) * this.moveSpeed
                playerVelocity.z += Math.cos(this.player.rotation.y) * this.moveSpeed
            }

            // Apply push force in the direction of collision
            const pushDirection = playerToBall.clone()
            const pushForce = this.pushStrength * (playerVelocity.length() + 1)
            this.ballVelocity.add(pushDirection.multiplyScalar(pushForce))
        }
    }

    private updatePlayer(deltaTime: number) {
        // Handle rotation
        if (this.keys['ArrowLeft']) {
            this.player.rotation.y += this.rotationSpeed * deltaTime
        }
        if (this.keys['ArrowRight']) {
            this.player.rotation.y -= this.rotationSpeed * deltaTime
        }

        // Handle movement
        if (this.keys['ArrowUp']) {
            this.player.position.x -= Math.sin(this.player.rotation.y) * this.moveSpeed * deltaTime
            this.player.position.z -= Math.cos(this.player.rotation.y) * this.moveSpeed * deltaTime
        }
        if (this.keys['ArrowDown']) {
            this.player.position.x += Math.sin(this.player.rotation.y) * this.moveSpeed * deltaTime
            this.player.position.z += Math.cos(this.player.rotation.y) * this.moveSpeed * deltaTime
        }

        // Apply gravity and handle jumping
        if (this.isJumping) {
            this.player.position.y += this.jumpVelocity * deltaTime
            this.jumpVelocity -= this.gravity * deltaTime

            // Check for landing
            if (this.player.position.y <= PLAYER_GROUND_LEVEL) {
                this.player.position.y = PLAYER_GROUND_LEVEL
                this.isJumping = false
                this.jumpVelocity = 0
            }
        }

        // Keep player within wider bounds (including extra area)
        const maxX = FIELD_EXTENDED_WIDTH / 2 - PLAYER_BODY_RADIUS
        const maxZ = FIELD_EXTENDED_LENGTH / 2 - PLAYER_BODY_RADIUS
        this.player.position.x = Math.max(-maxX, Math.min(maxX, this.player.position.x))
        this.player.position.z = Math.max(-maxZ, Math.min(maxZ, this.player.position.z))

        // Update camera after player movement
        this.updateCamera()
    }

    private handleWheel(event: WheelEvent) {
        // Update both distance and height based on scroll
        const scrollFactor = event.deltaY * 0.01
        this.cameraDistance = Math.max(this.minCameraDistance, Math.min(this.maxCameraDistance, this.cameraDistance + scrollFactor))

        // Adjust height proportionally with distance
        const heightProgress = (this.cameraDistance - this.minCameraDistance) / (this.maxCameraDistance - this.minCameraDistance)
        this.cameraHeight = this.minCameraHeight + (this.maxCameraHeight - this.minCameraHeight) * heightProgress + 40

        this.updateCamera()
    }

    private handleMouseDown(event: MouseEvent) {
        this.isDragging = true
        this.previousMousePosition = { x: event.clientX, y: event.clientY }
    }

    private handleMouseMove(event: MouseEvent) {
        if (!this.isDragging) return

        const deltaMove = {
            x: event.clientX - this.previousMousePosition.x,
            y: event.clientY - this.previousMousePosition.y
        }

        this.playerRotation += deltaMove.x * 0.01
        this.player.rotation.y = this.playerRotation
        this.updateCamera()

        this.previousMousePosition = { x: event.clientX, y: event.clientY }
    }

    private handleMouseUp() {
        this.isDragging = false
    }

    private handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    private updateCamera() {
        // Calculate camera position relative to player's rotation
        const x = this.player.position.x + Math.sin(this.playerRotation) * this.cameraDistance
        const z = this.player.position.z + Math.cos(this.playerRotation) * this.cameraDistance

        // Use the dynamic height
        this.camera.position.set(x, this.cameraHeight, z)
        this.camera.lookAt(this.player.position)
    }

    private animate() {
        const currentTime = performance.now()
        const deltaTime = (currentTime - this.lastTime) / 1000
        this.lastTime = currentTime

        this.stats.begin()

        this.updatePlayer(deltaTime)
        this.updateBall(deltaTime)
        this.renderer.render(this.scene, this.camera)

        this.stats.end()

        requestAnimationFrame(this.animate.bind(this))
    }
}
