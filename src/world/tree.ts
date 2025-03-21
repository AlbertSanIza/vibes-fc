import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three'

export class Tree {
    private _mesh: Group

    constructor(height: number, size: number) {
        this._mesh = new Group()
        const trunkGeometry = new CylinderGeometry(0.4, 0.6, height, 3)
        const trunkMaterial = new MeshStandardMaterial({ color: 0x8b4513 }) // Saddle Brown
        const trunk = new Mesh(trunkGeometry, trunkMaterial)
        trunk.position.y = height / 2
        trunk.castShadow = true
        this._mesh.add(trunk)
        const crownMaterial = new MeshStandardMaterial({ color: 0x228b22 })
        const firstCrownGeometry = new SphereGeometry(size, 8, 8)
        const firstCrown = new Mesh(firstCrownGeometry, crownMaterial)
        firstCrown.position.y = height
        firstCrown.castShadow = true
        this._mesh.add(firstCrown)
        for (let i = 0; i < 5 + Math.floor(Math.random() * 3); i++) {
            const radius = size / 2 - 0.5 + Math.random() * 1
            const crowGeometry = new SphereGeometry(radius, 8, 8)
            const crown = new Mesh(crowGeometry, crownMaterial)
            crown.position.x = radius + Math.random()
            crown.position.y = height - Math.random()
            crown.position.z = radius * Math.random()
            crown.castShadow = true
            this._mesh.add(crown)
        }
    }

    get mesh() {
        return this._mesh
    }
}
