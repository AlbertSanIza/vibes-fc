import * as THREE from 'three'

// Scene setup
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x87ceeb) // Sky blue background

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 10, 20)
camera.lookAt(0, 0, 0)

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(5, 5, 5)
directionalLight.castShadow = true
scene.add(directionalLight)

// Soccer field dimensions
const fieldWidth = 20
const fieldLength = 30
const wallHeight = 2

// Field (green plane)
const fieldGeometry = new THREE.PlaneGeometry(fieldWidth, fieldLength)
const fieldMaterial = new THREE.MeshStandardMaterial({
    color: 0x2e8b57, // Forest green
    side: THREE.DoubleSide
})
const field = new THREE.Mesh(fieldGeometry, fieldMaterial)
field.rotation.x = -Math.PI / 2
field.receiveShadow = true
scene.add(field)

// Walls
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
const walls = []

// Create walls
const wallPositions = [
    {
        position: [0, wallHeight / 2, fieldLength / 2] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        size: [fieldWidth, wallHeight, 1] as [number, number, number]
    }, // North
    {
        position: [0, wallHeight / 2, -fieldLength / 2] as [number, number, number],
        rotation: [0, Math.PI, 0] as [number, number, number],
        size: [fieldWidth, wallHeight, 1] as [number, number, number]
    }, // South
    {
        position: [fieldWidth / 2, wallHeight / 2, 0] as [number, number, number],
        rotation: [0, Math.PI / 2, 0] as [number, number, number],
        size: [fieldLength, wallHeight, 1] as [number, number, number]
    }, // East
    {
        position: [-fieldWidth / 2, wallHeight / 2, 0] as [number, number, number],
        rotation: [0, -Math.PI / 2, 0] as [number, number, number],
        size: [fieldLength, wallHeight, 1] as [number, number, number]
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
    scene.add(wall)
})

// Goals
const goalWidth = 4
const goalHeight = 2
const goalDepth = 1
const goalMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })

// Create goals
const goalPositions = [
    { position: [0, goalHeight / 2, fieldLength / 2 + goalDepth / 2] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] }, // North goal
    { position: [0, goalHeight / 2, -fieldLength / 2 - goalDepth / 2] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number] } // South goal
]

goalPositions.forEach(({ position, rotation }) => {
    const goalGeometry = new THREE.BoxGeometry(goalWidth, goalHeight, goalDepth)
    const goal = new THREE.Mesh(goalGeometry, goalMaterial)
    goal.position.set(...position)
    goal.rotation.set(...rotation)
    goal.castShadow = true
    goal.receiveShadow = true
    scene.add(goal)
})

// Ground plane (extends beyond field)
const groundGeometry = new THREE.PlaneGeometry(fieldWidth * 3, fieldLength * 3)
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x90ee90, // Light green
    side: THREE.DoubleSide
})
const ground = new THREE.Mesh(groundGeometry, groundMaterial)
ground.rotation.x = -Math.PI / 2
ground.position.y = -0.1 // Slightly below field to prevent z-fighting
ground.receiveShadow = true
scene.add(ground)

// Simple trees
const createTree = (x: number, z: number) => {
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 2, 8)
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.set(x, 1, z)
    trunk.castShadow = true
    trunk.receiveShadow = true

    const crownGeometry = new THREE.ConeGeometry(1, 2, 8)
    const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 })
    const crown = new THREE.Mesh(crownGeometry, crownMaterial)
    crown.position.set(x, 2.5, z)
    crown.castShadow = true
    crown.receiveShadow = true

    scene.add(trunk)
    scene.add(crown)
}

// Add some trees around the field
createTree(fieldWidth, fieldLength)
createTree(-fieldWidth, fieldLength)
createTree(fieldWidth, -fieldLength)
createTree(-fieldWidth, -fieldLength)

// Animation loop
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

// Start animation
animate()
