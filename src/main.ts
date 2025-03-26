import { Game } from './game'
import { Overlay } from './overlay'
import './style.css'
import { World } from './world'

// X Axis = Left/Right
// Y Axis = Up/Down
// Z Axis = Back/Forward

class Main {
    overlay: Overlay
    world: World
    game: Game

    constructor() {
        this.overlay = new Overlay()
        this.world = new World()
        this.game = new Game(this.world.scene, this.world.camera, this.world.renderer)
        this.setupEventListeners()
        this.animate()
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.world.camera.aspect = window.innerWidth / window.innerHeight
            this.world.camera.updateProjectionMatrix()
            this.world.renderer.setSize(window.innerWidth, window.innerHeight)
        })
    }

    animate() {
        this.world.renderer.render(this.world.scene, this.world.camera)
        requestAnimationFrame(() => this.animate())
    }
}

new Main()
