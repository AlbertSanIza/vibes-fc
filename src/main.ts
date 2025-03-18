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

// Clouds
const createCloud = (x: number, y: number, z: number, size: number) => {
    const cloudGeometry = new THREE.SphereGeometry(size, 8, 8)
    const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    })

    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial)
    cloud.position.set(x, y, z)
    cloud.castShadow = true
    cloud.receiveShadow = true
    scene.add(cloud)
}

// Add some clouds
createCloud(-15, 8, -10, 2)
createCloud(15, 10, 5, 2.5)
createCloud(0, 12, -15, 3)
createCloud(-10, 9, 15, 2.2)
createCloud(10, 11, -20, 2.8)

// Soccer field dimensions
const fieldWidth = 20
const fieldLength = 30
const wallHeight = 2
const lineWidth = 0.2
const lineColor = 0xffffff

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

// Field lines
const createFieldLine = (width: number, length: number, position: [number, number, number], rotation: [number, number, number]) => {
    const lineGeometry = new THREE.PlaneGeometry(width, length)
    const lineMaterial = new THREE.MeshStandardMaterial({ color: lineColor })
    const line = new THREE.Mesh(lineGeometry, lineMaterial)
    line.position.set(...position)
    line.rotation.set(...rotation)
    line.receiveShadow = true
    scene.add(line)
}

// Center line
createFieldLine(fieldWidth, lineWidth, [0, 0.01, 0], [-Math.PI / 2, 0, 0])

// Center circle
const centerCircleRadius = 3
const centerCircleGeometry = new THREE.RingGeometry(centerCircleRadius - lineWidth / 2, centerCircleRadius + lineWidth / 2, 32)
const centerCircleMaterial = new THREE.MeshStandardMaterial({ color: lineColor })
const centerCircle = new THREE.Mesh(centerCircleGeometry, centerCircleMaterial)
centerCircle.rotation.x = -Math.PI / 2
centerCircle.position.y = 0.01
centerCircle.receiveShadow = true
scene.add(centerCircle)

// Penalty areas
const penaltyAreaWidth = 8
const penaltyAreaLength = 4
const penaltyAreaPositions = [
    { position: [0, 0.01, fieldLength / 2 - penaltyAreaLength / 2] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number] },
    { position: [0, 0.01, -fieldLength / 2 + penaltyAreaLength / 2] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number] }
]

penaltyAreaPositions.forEach(({ position, rotation }) => {
    createFieldLine(penaltyAreaWidth, lineWidth, position, rotation)
    createFieldLine(lineWidth, penaltyAreaLength, position, rotation)
})

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
const goalDepth = 2
const goalPostRadius = 0.1
const goalNetColor = 0xffffff

const createGoal = (position: [number, number, number], rotation: [number, number, number]) => {
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

    scene.add(leftPost)
    scene.add(rightPost)
    scene.add(crossbar)
    scene.add(net)
}

// Create goals
const goalPositions = [
    { position: [0, 0, fieldLength / 2 + goalDepth / 2] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] }, // North goal
    { position: [0, 0, -fieldLength / 2 - goalDepth / 2] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number] } // South goal
]

goalPositions.forEach(({ position, rotation }) => {
    createGoal(position, rotation)
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
