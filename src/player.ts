import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, Shape, ShapeGeometry, SphereGeometry } from 'three'

export class Player {
    private _name: string
    private color: number
    private height: number
    private radius: number
    private shininess: number
    private _mesh: Group

    constructor({ name = 'Player', color = 0x0000ff }: { name?: string; color?: number } = {}) {
        this._name = name
        this.color = color
        this.height = 2
        this.radius = 0.6
        this.shininess = 30
        this._mesh = new Group()
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
        const headGeometry = new SphereGeometry(this.radius, 32, 32)
        const headMaterial = new MeshPhongMaterial({ color: this.color, shininess: this.shininess })
        const head = new Mesh(headGeometry, headMaterial)
        head.position.y = this.height - this.radius
        return head
    }

    private createTorso() {
        const torsoGeometry = new CylinderGeometry(this.radius, this.radius, this.height - this.radius * 2, 32)
        const torsoMaterial = new MeshPhongMaterial({ color: this.color, shininess: this.shininess })
        const torso = new Mesh(torsoGeometry, torsoMaterial)
        torso.position.y = this.height / 2
        return torso
    }

    private createBottom() {
        const bottomGeometry = new SphereGeometry(this.radius, 32, 32)
        const bottomMaterial = new MeshPhongMaterial({ color: this.color, shininess: this.shininess })
        const bottom = new Mesh(bottomGeometry, bottomMaterial)
        bottom.position.y = this.radius
        return bottom
    }

    private createDirection() {
        const triangleShape = new Shape()
        triangleShape.moveTo(0, 0.3)
        triangleShape.lineTo(0.3, 0)
        triangleShape.lineTo(-0.3, 0)
        triangleShape.lineTo(0, 0.3)
        const directionGeometry = new ShapeGeometry(triangleShape)
        const directionMaterial = new MeshBasicMaterial({ color: 0xffff00 })
        const direction = new Mesh(directionGeometry, directionMaterial)
        direction.rotation.x = -Math.PI / 2
        direction.position.set(0, 0.1, -this.radius * 2)
        return direction
    }
}
