import * as THREE from 'three'

const PLAYER_RADIUS = 0.6
const PLAYER_HEIGHT = 1.8
const PLAYER_SHININESS = 30

export class Player {
    name: string
    color: number
    mesh: THREE.Group

    constructor(name: string = 'Player', color: number = 0x0000ff) {
        this.name = name
        this.color = color

        this.mesh = new THREE.Group()
        const torso = this.createTorso()
        const head = this.createHead()
        this.mesh.add(torso)
        this.mesh.add(head)
    }

    private createHead() {
        const headGeometry = new THREE.SphereGeometry(PLAYER_RADIUS, 32, 32)
        const headMaterial = new THREE.MeshPhongMaterial({ color: this.color, shininess: PLAYER_SHININESS })
        const head = new THREE.Mesh(headGeometry, headMaterial)
        head.position.y = PLAYER_HEIGHT / 2 + PLAYER_RADIUS
        return head
    }

    private createTorso() {
        const torsoGeometry = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT - PLAYER_RADIUS * 2, 32)
        const torsoMaterial = new THREE.MeshPhongMaterial({ color: this.color, shininess: PLAYER_SHININESS })
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial)
        torso.position.y = PLAYER_HEIGHT / 2 - PLAYER_RADIUS
        return torso
    }

    private arrow() {
        const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 0), 1, 0xff0000)
        arrow.position.y = PLAYER_HEIGHT / 2
        return arrow
    }
}
