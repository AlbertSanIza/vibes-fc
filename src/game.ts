import * as THREE from 'three'

class Game {
    private scene: THREE.Scene
    private camera: THREE.PerspectiveCamera
    private renderer: THREE.WebGLRenderer
    private player!: THREE.Mesh
    private moveSpeed: number = 0.3
    private cameraDistance: number = 5
    private cameraAngle: number = 0
    private isDragging: boolean = false
    private previousMousePosition: { x: number; y: number } = { x: 0, y: 0 }

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
        this.player.position.set(0, 0.5, 0) // Position at center of field
        this.scene.add(this.player)

        // Event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this))
        window.addEventListener('wheel', this.handleWheel.bind(this))
        window.addEventListener('mousedown', this.handleMouseDown.bind(this))
        window.addEventListener('mousemove', this.handleMouseMove.bind(this))
        window.addEventListener('mouseup', this.handleMouseUp.bind(this))
        window.addEventListener('resize', this.handleResize.bind(this))

        // Start animation loop
        this.animate()
    }

    private handleKeyDown(event: KeyboardEvent) {
        const newPosition = this.player.position.clone()

        switch (event.key) {
            case 'ArrowUp':
                newPosition.z -= this.moveSpeed
                break
            case 'ArrowDown':
                newPosition.z += this.moveSpeed
                break
            case 'ArrowLeft':
                newPosition.x -= this.moveSpeed
                break
            case 'ArrowRight':
                newPosition.x += this.moveSpeed
                break
        }

        // Check if new position is within bounds (inside the field)
        if (Math.abs(newPosition.x) < 9 && Math.abs(newPosition.z) < 14) {
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

        this.cameraAngle += deltaMove.x * 0.01
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
        const x = this.player.position.x + Math.sin(this.cameraAngle) * this.cameraDistance
        const z = this.player.position.z + Math.cos(this.cameraAngle) * this.cameraDistance
        this.camera.position.set(x, 2, z)
        this.camera.lookAt(this.player.position)
    }

    private animate() {
        requestAnimationFrame(this.animate.bind(this))
        this.renderer.render(this.scene, this.camera)
    }
}

// Start the game when the page loads and scene is ready
window.addEventListener('load', () => {
    // Small delay to ensure scene is initialized
    setTimeout(() => {
        new Game()
    }, 100)
})
