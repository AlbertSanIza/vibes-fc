import { CylinderGeometry, Group, Mesh, MeshStandardMaterial } from 'three'

export class Tree {
    private _mesh: Group

    constructor(height: number) {
        this._mesh = new Group()
        const trunkGeometry = new CylinderGeometry(0.4, 0.6, height, 3)
        const trunkMaterial = new MeshStandardMaterial({ color: 0x8b4513 }) // Saddle Brown
        const trunk = new Mesh(trunkGeometry, trunkMaterial)
        trunk.castShadow = true
        this._mesh.add(trunk)
    }

    get mesh() {
        return this._mesh
    }
}
