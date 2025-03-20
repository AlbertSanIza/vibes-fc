import * as THREE from 'three'

export class Player {
    private _name: string
    private color: number
    private height: number
    private radius: number
    private shininess: number
    private _mesh: THREE.Group

    constructor({ name = 'Player', color = 0x0000ff }: { name?: string; color?: number } = {}) {
        this._name = name
        this.color = color
        this.height = 2
        this.radius = 0.6
        this.shininess = 30
        this._mesh = new THREE.Group()
        this._mesh.add(this.createHead())
        this._mesh.add(this.createTorso())
        this._mesh.add(this.createBottom())
        this._mesh.add(this.createDirection())
    }

    get name() {
        return this._name
    }

    get mesh() {
        return this._mesh
    }

    private createHead() {
        const headGeometry = new THREE.SphereGeometry(this.radius, 32, 32)
        const headMaterial = new THREE.MeshPhongMaterial({ color: this.color, shininess: this.shininess })
        const head = new THREE.Mesh(headGeometry, headMaterial)
        head.position.y = this.height - this.radius
        return head
    }

    private createTorso() {
        const torsoGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height - this.radius * 2, 32)
        const torsoMaterial = new THREE.MeshPhongMaterial({ color: this.color, shininess: this.shininess })
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial)
        torso.position.y = this.height / 2
        return torso
    }

    private createBottom() {
        const bottomGeometry = new THREE.SphereGeometry(this.radius, 32, 32)
        const bottomMaterial = new THREE.MeshPhongMaterial({ color: this.color, shininess: this.shininess })
        const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial)
        bottom.position.y = this.radius
        return bottom
    }

    private createDirection() {
        const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 0), 1, 0xff0000)
        arrow.position.y = this.height / 2
        return arrow
    }
}
