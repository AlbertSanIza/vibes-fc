import { Scene } from './scene'
import './game'
import './style.css'

// Create the scene
new Scene()

// Animation loop
function animate() {
    requestAnimationFrame(animate)
    ;(window as any).renderer.render((window as any).scene, (window as any).camera)
}

// Handle window resize
window.addEventListener('resize', () => {
    const camera = (window as any).camera
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    ;(window as any).renderer.setSize(window.innerWidth, window.innerHeight)
})

// Start animation
animate()
