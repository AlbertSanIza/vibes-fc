import { Group, Mesh, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three'
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
    FIELD_GOAL_HEIGHT,
    FIELD_GOAL_WIDTH,
    FIELD_LENGTH,
    FIELD_LENGTH_HALF,
    FIELD_WIDTH,
    PLAYER_GRAVITY,
    PLAYER_JUMP_FORCE
} from './constants'
import { Player } from './player'
import { Minimap } from './world/mini-map'
import { Scoreboard } from './world/scoreboard'

export class Game {
    private scene: Scene
    private camera: PerspectiveCamera
    private renderer: WebGLRenderer
    private player: Player
    private ball?: Group
    private stats: Stats = new Stats()
    private cameraDistance: number = CAMERA_DISTANCE
    private cameraHeight: number = 5
    private playerRotation: number = 0
    private keys: { [key: string]: boolean } = {}
    private isJumping: boolean = false
    private jumpVelocity: number = 0
    private jumpForce: number = PLAYER_JUMP_FORCE
    private lastTime: number = 0
    private isDragging: boolean = false
    private previousMousePosition: { x: number; y: number } = { x: 0, y: 0 }
    private ballVelocity = new Vector3(0, 0, 0)
    private minCameraDistance: number = 5
    private maxCameraDistance: number = 15
    private minCameraHeight: number = 1
    private maxCameraHeight: number = 10
    private isCameraOnBall: boolean = false
    private isCameraSideFollow: boolean = false
    private scoreboard: Scoreboard
    private minimap: Minimap

    constructor(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.player = new Player()

        // Initialize Stats
        document.body.appendChild(this.stats.dom)
        this.stats.dom.style.top = 'auto'
        this.stats.dom.style.bottom = '0'

        this.player.mesh.position.set(0, 0, FIELD_LENGTH_HALF / 2)
        this.scene.add(this.player.mesh)

        // Initialize scoreboard
        this.scoreboard = new Scoreboard()
        this.scoreboard.mesh.rotation.y = -Math.PI / 2
        this.scoreboard.mesh.position.set(FIELD_EXTENDED_WIDTH / 2, 0, 0)
        this.scene.add(this.scoreboard.mesh)

        // Initialize minimap
        this.minimap = new Minimap()

        // Try loading GLB first
        const gltfLoader = new GLTFLoader()
        gltfLoader.load('/vibes-fc/ball.glb', (gltf) => {
            const model = gltf.scene
            model.traverse((child) => {
                if (child instanceof Mesh) {
                    child.castShadow = true
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
            this.player.isRunning = true
        }
        if (event.key === 'z' || event.key === 'Z') {
            this.isCameraOnBall = !this.isCameraOnBall
            if (this.isCameraOnBall) {
                this.isCameraSideFollow = false
            }
        }
        if (event.key === 'c' || event.key === 'C') {
            this.isCameraSideFollow = !this.isCameraSideFollow
            if (this.isCameraSideFollow) {
                this.isCameraOnBall = false
            }
        }
    }

    private handleKeyUp(event: KeyboardEvent) {
        this.keys[event.key] = false
        if (event.key === 'Shift') {
            this.player.isRunning = false
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
            const rotationAxis = new Vector3(this.ballVelocity.z, 0, -this.ballVelocity.x).normalize()
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

        // Only bounce off side boundaries (x-axis)
        if (Math.abs(this.ball.position.x) > fieldBoundaryX) {
            this.ball.position.x = Math.sign(this.ball.position.x) * fieldBoundaryX
            this.ballVelocity.x *= -BALL_BOUNCE
        }

        // Check for goals (z-axis)
        if (Math.abs(this.ball.position.z) > fieldBoundaryZ) {
            // Check if ball is within goal width
            if (Math.abs(this.ball.position.x) < FIELD_GOAL_WIDTH / 2 && this.ball.position.y < FIELD_GOAL_HEIGHT) {
                // Goal scored! Update score and reset ball position
                if (this.ball.position.z > 0) {
                    this.scoreboard.incrementScore('blue') // Blue team scored in north goal
                } else {
                    this.scoreboard.incrementScore('red') // Red team scored in south goal
                }
                this.resetBall()
            } else {
                // Ball hit the boundary outside goal area, bounce back
                this.ball.position.z = Math.sign(this.ball.position.z) * fieldBoundaryZ
                this.ballVelocity.z *= -BALL_BOUNCE
            }
        }

        // Check for collision with player
        const playerToBall = this.ball.position.clone().sub(this.player.mesh.position)
        const distance = playerToBall.length()

        const collisionDistance = this.player.body.radius + BALL_RADIUS
        if (distance < collisionDistance) {
            // Normalize direction
            playerToBall.normalize()

            // Move ball out of collision
            this.ball.position.copy(this.player.mesh.position.clone().add(playerToBall.multiplyScalar(collisionDistance)))

            // Calculate kick force based on player movement
            const playerVelocity = new Vector3()
            if (this.keys['ArrowUp']) {
                playerVelocity.x -= Math.sin(this.player.mesh.rotation.y) * this.player.speed.move
                playerVelocity.z -= Math.cos(this.player.mesh.rotation.y) * this.player.speed.move
            }
            if (this.keys['ArrowDown']) {
                playerVelocity.x += Math.sin(this.player.mesh.rotation.y) * this.player.speed.move
                playerVelocity.z += Math.cos(this.player.mesh.rotation.y) * this.player.speed.move
            }

            // Apply kick force with reduced vertical component
            const kickStrength = BALL_KICK_FORCE * (1 + playerVelocity.length() / this.player.speed.move)
            this.ballVelocity.copy(playerToBall.multiplyScalar(kickStrength))
            this.ballVelocity.y = BALL_VERTICAL_FORCE // Use constant vertical force
        }
    }

    private resetBall() {
        if (!this.ball) return
        this.ball.position.set(0, 10, 0)
        this.ballVelocity.set(0, 0, 0)
        this.ball.rotation.set(0, 0, 0)
    }

    private updatePlayer(deltaTime: number) {
        // Handle rotation
        if (this.keys['ArrowLeft']) {
            this.player.mesh.rotation.y += this.player.speed.rotate * deltaTime
        }
        if (this.keys['ArrowRight']) {
            this.player.mesh.rotation.y -= this.player.speed.rotate * deltaTime
        }

        // Handle movement
        if (this.keys['ArrowUp']) {
            this.player.mesh.position.x -= Math.sin(this.player.mesh.rotation.y) * this.player.speed.move * deltaTime
            this.player.mesh.position.z -= Math.cos(this.player.mesh.rotation.y) * this.player.speed.move * deltaTime
        }
        if (this.keys['ArrowRight']) {
            this.player.mesh.rotation.y -= this.player.speed.rotate * deltaTime
        }

        // Apply gravity and handle jumping
        if (this.isJumping) {
            this.player.mesh.position.y += this.jumpVelocity * deltaTime
            this.jumpVelocity -= PLAYER_GRAVITY * deltaTime

            // Check for landing
            if (this.player.mesh.position.y <= 0) {
                this.player.mesh.position.y = 0
                this.isJumping = false
                this.jumpVelocity = 0
            }
        }

        // Keep player within wider bounds (including extra area)
        const maxX = FIELD_EXTENDED_WIDTH / 2 - this.player.body.radius
        const maxZ = FIELD_EXTENDED_LENGTH / 2 - this.player.body.radius
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
        if (this.isCameraOnBall && this.ball) {
            // Calculate direction from player to ball
            const playerToBall = new Vector3()
            playerToBall.subVectors(this.ball.position, this.player.mesh.position).normalize()

            // Position camera behind player relative to ball
            const cameraOffset = playerToBall.clone().multiplyScalar(-this.cameraDistance)
            const x = this.player.mesh.position.x + cameraOffset.x
            const z = this.player.mesh.position.z + cameraOffset.z

            // Update camera position
            this.camera.position.set(x, this.cameraHeight, z)
            this.camera.lookAt(this.ball.position)
        } else if (this.isCameraSideFollow) {
            // Side-follow camera behavior: position camera to the side of the player
            const sideOffset = new Vector3(Math.cos(this.playerRotation), 0, -Math.sin(this.playerRotation)).multiplyScalar(this.cameraDistance)
            const x = this.player.mesh.position.x + sideOffset.x + 20
            const z = this.player.mesh.position.z + sideOffset.z
            this.camera.position.set(x, 20, z)
            this.camera.lookAt(this.player.mesh.position)
        } else {
            // Original third-person camera behavior
            const x = this.player.mesh.position.x + Math.sin(this.playerRotation) * this.cameraDistance
            const z = this.player.mesh.position.z + Math.cos(this.playerRotation) * this.cameraDistance
            this.camera.position.set(x, this.cameraHeight, z)
            this.camera.lookAt(this.player.mesh.position)
        }
    }

    private animate() {
        const currentTime = performance.now()
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1) // Cap at 100ms
        this.lastTime = currentTime

        this.stats.begin()

        this.updatePlayer(deltaTime)
        if (this.ball) {
            this.updateBall(deltaTime)
            // Update minimap with current positions and player color
            this.minimap.update(this.player.mesh.position, this.player.mesh.rotation.y, this.ball.position, this.player.body.color)
        }
        this.updateCamera()

        this.renderer.render(this.scene, this.camera)
        this.stats.update()

        requestAnimationFrame(this.animate.bind(this))
    }
}
