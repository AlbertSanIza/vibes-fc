import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, Shape, ShapeGeometry, SphereGeometry } from 'three'

import { MATH_PI_HALF } from './constants'

export class Player {
    name: string
    private _body: { height: number; radius: number; color: number; shininess: number }
    private _speed: { move: number; rotate: number }
    private _mesh: Group
    isRunning: boolean

    constructor({ name = 'Player', color = 0x0000ff }: { name?: string; color?: number } = {}) {
        this.name = name
        this._body = { height: 2, radius: 0.6, color, shininess: 30 }
        this._speed = { move: 16, rotate: 5 }
        this._mesh = new Group()
        this._mesh.add(this.createHead())
        this._mesh.add(this.createTorso())
        this._mesh.add(this.createBottom())
        this._mesh.add(this.createDirection())
        this.isRunning = false
    }

    get body() {
        return this._body
    }

    get speed() {
        return {
            move: this.isRunning ? this._speed.move * 1.5 : this._speed.move,
            rotate: this._speed.rotate
        }
    }

    get mesh() {
        return this._mesh
    }

    private createHead() {
        const headGeometry = new SphereGeometry(this.body.radius, 32, 32)
        const headMaterial = new MeshPhongMaterial({ color: this.body.color, shininess: this.body.shininess })
        const head = new Mesh(headGeometry, headMaterial)
        head.position.y = this.body.height - this.body.radius
        head.castShadow = true
        return head
    }

    private createTorso() {
        const torsoGeometry = new CylinderGeometry(this.body.radius, this.body.radius, this.body.height - this.body.radius * 2, 32)
        const torsoMaterial = new MeshPhongMaterial({ color: this.body.color, shininess: this.body.shininess })
        const torso = new Mesh(torsoGeometry, torsoMaterial)
        torso.position.y = this.body.height / 2
        torso.castShadow = true
        return torso
    }

    private createBottom() {
        const bottomGeometry = new SphereGeometry(this.body.radius, 32, 32)
        const bottomMaterial = new MeshPhongMaterial({ color: this.body.color, shininess: this.body.shininess })
        const bottom = new Mesh(bottomGeometry, bottomMaterial)
        bottom.position.y = this.body.radius
        bottom.castShadow = true
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
