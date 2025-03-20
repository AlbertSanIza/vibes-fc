import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, Shape, ShapeGeometry, SphereGeometry } from 'three'

import { MATH_PI_HALF } from './constants'

export class Player {
    private _name: string
    private _body: { height: number; radius: number; color: number }
    private shininess: number
    private _speed: { move: number; rotate: number }
    private _mesh: Group

    constructor({ name = 'Player', color = 0x0000ff }: { name?: string; color?: number } = {}) {
        this._name = name
        this._body = { height: 2, radius: 0.6, color }
        this.shininess = 30
        this._speed = { move: 0.1, rotate: 0.05 }
        this._mesh = new Group()
        this._mesh.add(this.createHead())
        this._mesh.add(this.createTorso())
        this._mesh.add(this.createBottom())
        this._mesh.add(this.createDirection())
    }

    get name() {
        return this._name
    }

    get body() {
        return this._body
    }

    get speed() {
        return this._speed
    }

    get mesh() {
        return this._mesh
    }

    private createHead() {
        const headGeometry = new SphereGeometry(this.body.radius, 32, 32)
        const headMaterial = new MeshPhongMaterial({ color: this.body.color, shininess: this.shininess })
        const head = new Mesh(headGeometry, headMaterial)
        head.position.y = this.body.height - this.body.radius
        return head
    }

    private createTorso() {
        const torsoGeometry = new CylinderGeometry(this.body.radius, this.body.radius, this.body.height - this.body.radius * 2, 32)
        const torsoMaterial = new MeshPhongMaterial({ color: this.body.color, shininess: this.shininess })
        const torso = new Mesh(torsoGeometry, torsoMaterial)
        torso.position.y = this.body.height / 2
        return torso
    }

    private createBottom() {
        const bottomGeometry = new SphereGeometry(this.body.radius, 32, 32)
        const bottomMaterial = new MeshPhongMaterial({ color: this.body.color, shininess: this.shininess })
        const bottom = new Mesh(bottomGeometry, bottomMaterial)
        bottom.position.y = this.body.radius
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
        direction.rotation.x = -MATH_PI_HALF
        direction.position.set(0, 0.1, -this.body.radius * 1.5)
        return direction
    }
}
