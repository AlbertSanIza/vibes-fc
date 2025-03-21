import { Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three'

export class Cloud {
    private _mesh: Group

    constructor(size: number) {
        this._mesh = new Group()
        const cloudMaterial = new MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
        for (let i = 0; i < 5 + Math.floor(Math.random() * 3); i++) {
            const cloudGeometry = new SphereGeometry(size * (0.7 + Math.random() * 0.6), 8, 8)
            const cloud = new Mesh(cloudGeometry, cloudMaterial)
            cloud.position.set((Math.random() - 0.5) * size * 2, (Math.random() - 0.5) * size, (Math.random() - 0.5) * size * 2)
            this._mesh.add(cloud)
        }
    }

    get mesh() {
        return this._mesh
    }
}
