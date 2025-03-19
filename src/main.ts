import './game'
import { Scene } from './scene'
import './style.css'

class Main {
    scene: Scene

    constructor() {
        this.scene = new Scene()
        this.setupEventListeners()
        this.animate()
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.scene.camera.aspect = window.innerWidth / window.innerHeight
            this.scene.camera.updateProjectionMatrix()
            this.scene.renderer.setSize(window.innerWidth, window.innerHeight)
        })
    }

    animate() {
        this.scene.renderer.render(this.scene.scene, this.scene.camera)
        requestAnimationFrame(() => this.animate())
    }
}

new Main()
