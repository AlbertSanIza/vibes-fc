import * as THREE from 'three'

class Game {
    private scene: THREE.Scene
    private camera: THREE.PerspectiveCamera
    private renderer: THREE.WebGLRenderer
    private player!: THREE.Mesh
    private moveSpeed: number = 5.0
    private cameraDistance: number = 5
    private playerRotation: number = 0
    private rotationSpeed: number = 2
    private isDragging: boolean = false
    private previousMousePosition: { x: number; y: number } = { x: 0, y: 0 }
    private keys: { [key: string]: boolean } = {}
    private lastTime: number = 0
    private isJumping: boolean = false
    private jumpVelocity: number = 0
    private jumpForce: number = 8.0
    private gravity: number = 20.0
    private groundLevel: number = 0.5

    constructor() {
        // Get existing scene, camera, and renderer from main.ts
        this.scene = (window as any).scene
        this.camera = (window as any).camera
        this.renderer = (window as any).renderer

        if (!this.scene || !this.camera || !this.renderer) {
            console.error('Scene, camera, or renderer not initialized')
            return
        }

        // Create player (blue rectangle)
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshPhongMaterial({ color: 0x0000ff })
        this.player = new THREE.Mesh(geometry, material)
        this.player.position.set(0, this.groundLevel, 0) // Position at center of field
        this.scene.add(this.player)

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

    private updatePlayer(deltaTime: number) {
        const newPosition = this.player.position.clone()
        let moved = false

        // Handle rotation
        if (this.keys['ArrowLeft']) {
            this.playerRotation += this.rotationSpeed * deltaTime
            this.player.rotation.y = this.playerRotation
            moved = true
        }
        if (this.keys['ArrowRight']) {
            this.playerRotation -= this.rotationSpeed * deltaTime
            this.player.rotation.y = this.playerRotation
            moved = true
        }

        // Handle movement
        if (this.keys['ArrowUp']) {
            newPosition.z -= Math.cos(this.playerRotation) * this.moveSpeed * deltaTime
            newPosition.x -= Math.sin(this.playerRotation) * this.moveSpeed * deltaTime
            moved = true
        }
        if (this.keys['ArrowDown']) {
            newPosition.z += Math.cos(this.playerRotation) * this.moveSpeed * deltaTime
            newPosition.x += Math.sin(this.playerRotation) * this.moveSpeed * deltaTime
            moved = true
        }

        // Handle jumping
        if (this.isJumping) {
            this.jumpVelocity -= this.gravity * deltaTime
            newPosition.y += this.jumpVelocity * deltaTime

            // Check if landed
            if (newPosition.y <= this.groundLevel) {
                newPosition.y = this.groundLevel
                this.isJumping = false
                this.jumpVelocity = 0
            }
        }

        // Check if new position is within bounds (inside the field)
        if (moved && Math.abs(newPosition.x) < 9 && Math.abs(newPosition.z) < 14) {
            this.player.position.copy(newPosition)
            this.updateCamera()
        }
    }

    private handleWheel(event: WheelEvent) {
        this.cameraDistance = Math.max(3, Math.min(10, this.cameraDistance + event.deltaY * 0.01))
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
        this.camera.position.set(x, 2, z)
        this.camera.lookAt(this.player.position)
    }

    private animate() {
        const currentTime = performance.now()
        const deltaTime = (currentTime - this.lastTime) / 1000 // Convert to seconds
        this.lastTime = currentTime

        this.updatePlayer(deltaTime)
        this.renderer.render(this.scene, this.camera)

        requestAnimationFrame(this.animate.bind(this))
    }
}

// Start the game when the page loads and scene is ready
window.addEventListener('load', () => {
    // Small delay to ensure scene is initialized
    setTimeout(() => {
        new Game()
    }, 100)
})
