import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import {
    BALL_BOUNCE,
    BALL_FRICTION,
    BALL_GRAVITY,
    BALL_KICK_FORCE,
    BALL_RADIUS,
    BALL_VERTICAL_FORCE,
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
    PLAYER_SHININESS,
    PLAYER_SPRINT_SPEED
} from './constants'
import { Player } from './player'

export class Game {
    private scene: THREE.Scene
    private camera: THREE.PerspectiveCamera
    private renderer: THREE.WebGLRenderer
    private player!: Player
    private player_old!: THREE.Group
    private ball?: THREE.Group
    private stats: Stats = new Stats()
    private moveSpeed: number = PLAYER_MOVE_SPEED
    private cameraDistance: number = CAMERA_DISTANCE
    private cameraHeight: number = 5
    private playerRotation: number = 0
    private rotationSpeed: number = PLAYER_ROTATION_SPEED
    private keys: { [key: string]: boolean } = {}
    private isJumping: boolean = false
    private jumpVelocity: number = 0
    private jumpForce: number = PLAYER_JUMP_FORCE
    private lastTime: number = 0
    private isDragging: boolean = false
    private previousMousePosition: { x: number; y: number } = { x: 0, y: 0 }
    private ballVelocity = new THREE.Vector3(0, 0, 0)
    private minCameraDistance: number = 5
    private maxCameraDistance: number = 15
    private minCameraHeight: number = 5
    private maxCameraHeight: number = 15
    private isSprinting: boolean = false
    private isCameraOnBall: boolean = false

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.player = new Player()

        // Initialize Stats
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
        playerGroup.add(triangle)

        // Add the group to the scene
        this.player_old = playerGroup
        this.player_old.position.set(0, PLAYER_GROUND_LEVEL, 5)
        this.player.mesh.position.set(0, PLAYER_GROUND_LEVEL, 5)
        this.scene.add(this.player.mesh)
        this.scene.add(this.player_old)

        // Try loading GLB first
        const gltfLoader = new GLTFLoader()
        gltfLoader.load('/vibes-fc/ball.glb', (gltf) => {
            const model = gltf.scene
            model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })

            model.position.set(0, 0, 0)
            model.scale.set(BALL_RADIUS, BALL_RADIUS, BALL_RADIUS)

            this.ball = model
            this.scene.add(model)
        })

        // Event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this))
        window.addEventListener('keyup', this.handleKeyUp.bind(this))
        window.addEventListener('wheel', this.handleWheel.bind(this))
        window.addEventListener('mousedown', this.handleMouseDown.bind(this))
        window.addEventListener('mousemove', this.handleMouseMove.bind(this))
        window.addEventListener('mouseup', this.handleMouseUp.bind(this))

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
        if (event.key === 'Shift') {
            this.isSprinting = true
            this.moveSpeed = PLAYER_SPRINT_SPEED
        }
        if (event.key === 'z' || event.key === 'Z') {
            this.isCameraOnBall = !this.isCameraOnBall
        }
    }

    private handleKeyUp(event: KeyboardEvent) {
        this.keys[event.key] = false
        if (event.key === 'Shift') {
            this.isSprinting = false
            this.moveSpeed = PLAYER_MOVE_SPEED
        }
    }

    private updateBall(deltaTime: number) {
        if (!this.ball) return

        // Apply friction only when ball is on the ground
        if (this.ball.position.y <= BALL_RADIUS) {
            this.ballVelocity.multiplyScalar(BALL_FRICTION)
        }

        // Update ball position based on velocity
        this.ball.position.add(this.ballVelocity.clone().multiplyScalar(deltaTime))

        // Add ball rotation based on movement only if the ball is moving significantly
        const speed = this.ballVelocity.length()
        if (speed > 0.1) {
            // Only rotate if moving faster than threshold
            const rotationAxis = new THREE.Vector3(this.ballVelocity.z, 0, -this.ballVelocity.x).normalize()
            const rotationAngle = speed * (deltaTime / BALL_RADIUS) // Adjust rotation based on ball size
            if (rotationAxis.length() > 0.001) {
                this.ball.rotateOnWorldAxis(rotationAxis, rotationAngle)
            }
        }

        // Check for collision with ground
        if (this.ball.position.y <= BALL_RADIUS) {
            this.ball.position.y = BALL_RADIUS
            this.ballVelocity.y = -this.ballVelocity.y * BALL_BOUNCE
        } else {
            // Apply gravity
            this.ballVelocity.y -= BALL_GRAVITY * deltaTime
        }

        // Check for collision with field boundaries
        const fieldBoundaryX = FIELD_WIDTH / 2 - BALL_RADIUS
        const fieldBoundaryZ = FIELD_LENGTH / 2 - BALL_RADIUS

        if (Math.abs(this.ball.position.x) > fieldBoundaryX) {
            this.ball.position.x = Math.sign(this.ball.position.x) * fieldBoundaryX
            this.ballVelocity.x *= -BALL_BOUNCE
        }

        if (Math.abs(this.ball.position.z) > fieldBoundaryZ) {
            this.ball.position.z = Math.sign(this.ball.position.z) * fieldBoundaryZ
            this.ballVelocity.z *= -BALL_BOUNCE
        }

        // Check for collision with player
        const playerToBall = this.ball.position.clone().sub(this.player.mesh.position)
        const distance = playerToBall.length()

        const collisionDistance = PLAYER_BODY_RADIUS + BALL_RADIUS
        if (distance < collisionDistance) {
            // Normalize direction
            playerToBall.normalize()

            // Move ball out of collision
            this.ball.position.copy(this.player.mesh.position.clone().add(playerToBall.multiplyScalar(collisionDistance)))

            // Calculate kick force based on player movement
            const playerVelocity = new THREE.Vector3()
            if (this.keys['ArrowUp']) {
                playerVelocity.x -= Math.sin(this.player.mesh.rotation.y) * this.moveSpeed
                playerVelocity.z -= Math.cos(this.player.mesh.rotation.y) * this.moveSpeed
            }
            if (this.keys['ArrowDown']) {
                playerVelocity.x += Math.sin(this.player.mesh.rotation.y) * this.moveSpeed
                playerVelocity.z += Math.cos(this.player.mesh.rotation.y) * this.moveSpeed
            }

            // Apply kick force with reduced vertical component
            const kickStrength = BALL_KICK_FORCE * (1 + playerVelocity.length() / this.moveSpeed)
            this.ballVelocity.copy(playerToBall.multiplyScalar(kickStrength))
            this.ballVelocity.y = BALL_VERTICAL_FORCE // Use constant vertical force
        }
    }

    private updatePlayer(deltaTime: number) {
        // Handle rotation
        if (this.keys['ArrowLeft']) {
            this.player.mesh.rotation.y += this.rotationSpeed * deltaTime
        }
        if (this.keys['ArrowRight']) {
            this.player.mesh.rotation.y -= this.rotationSpeed * deltaTime
        }

        // Handle movement
        if (this.keys['ArrowUp']) {
            this.player.mesh.position.x -= Math.sin(this.player.mesh.rotation.y) * this.moveSpeed * deltaTime
            this.player.mesh.position.z -= Math.cos(this.player.mesh.rotation.y) * this.moveSpeed * deltaTime
        }
        if (this.keys['ArrowRight']) {
            this.player.mesh.rotation.y -= this.rotationSpeed * deltaTime
        }

        // Apply gravity and handle jumping
        if (this.isJumping) {
            this.player.mesh.position.y += this.jumpVelocity * deltaTime
            this.jumpVelocity -= PLAYER_GRAVITY * deltaTime

            // Check for landing
            if (this.player.mesh.position.y <= PLAYER_GROUND_LEVEL) {
                this.player.mesh.position.y = PLAYER_GROUND_LEVEL
                this.isJumping = false
                this.jumpVelocity = 0
            }
        }

        // Keep player within wider bounds (including extra area)
        const maxX = FIELD_EXTENDED_WIDTH / 2 - PLAYER_BODY_RADIUS
        const maxZ = FIELD_EXTENDED_LENGTH / 2 - PLAYER_BODY_RADIUS
        this.player.mesh.position.x = Math.max(-maxX, Math.min(maxX, this.player.mesh.position.x))
        this.player.mesh.position.z = Math.max(-maxZ, Math.min(maxZ, this.player.mesh.position.z))

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
        this.player.mesh.rotation.y = this.playerRotation
        this.updateCamera()

        this.previousMousePosition = { x: event.clientX, y: event.clientY }
    }

    private handleMouseUp() {
        this.isDragging = false
    }

    private updateCamera() {
        // Camera position always follows player
        const x = this.player.mesh.position.x + Math.sin(this.playerRotation) * this.cameraDistance
        const z = this.player.mesh.position.z + Math.cos(this.playerRotation) * this.cameraDistance

        // Update camera position
        this.camera.position.set(x, this.cameraHeight, z)

        // Look at ball or player based on toggle
        const lookTarget = this.isCameraOnBall && this.ball ? this.ball.position : this.player.mesh.position
        this.camera.lookAt(lookTarget)
    }

    private animate() {
        const currentTime = performance.now()
        const deltaTime = (currentTime - this.lastTime) / 1000
        this.lastTime = currentTime

        this.stats.begin()

        this.updatePlayer(deltaTime)

        // Only update ball if it exists
        if (this.ball) {
            this.updateBall(deltaTime)
        }
        this.renderer.render(this.scene, this.camera)

        this.stats.end()

        requestAnimationFrame(this.animate.bind(this))
    }
}
