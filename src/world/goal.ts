import { CylinderGeometry, Group, Mesh, MeshStandardMaterial } from 'three'
import { FIELD_GOAL_HEIGHT, FIELD_GOAL_POST_RADIUS, FIELD_GOAL_WIDTH, MATH_PI_HALF } from '../constants'

export class Goal {
    private _mesh: Group

    constructor() {
        this._mesh = new Group()

        // Goal posts
        const postGeometry = new CylinderGeometry(FIELD_GOAL_POST_RADIUS, FIELD_GOAL_POST_RADIUS, FIELD_GOAL_HEIGHT, 8)
        const postMaterial = new MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.2 })

        // Left post
        const leftPost = new Mesh(postGeometry, postMaterial)
        leftPost.position.set(-FIELD_GOAL_WIDTH / 2, FIELD_GOAL_HEIGHT / 2 + FIELD_GOAL_POST_RADIUS, 0)
        leftPost.castShadow = true
        this._mesh.add(leftPost)

        // Right post
        const rightPost = new Mesh(postGeometry, postMaterial)
        rightPost.position.set(FIELD_GOAL_WIDTH / 2, FIELD_GOAL_HEIGHT / 2 + FIELD_GOAL_POST_RADIUS, 0)
        rightPost.castShadow = true
        this._mesh.add(rightPost)

        // Crossbar
        const crossbarGeometry = new CylinderGeometry(FIELD_GOAL_POST_RADIUS, FIELD_GOAL_POST_RADIUS, FIELD_GOAL_WIDTH + FIELD_GOAL_POST_RADIUS, 8)
        const crossbar = new Mesh(crossbarGeometry, postMaterial)
        crossbar.rotation.z = MATH_PI_HALF
        crossbar.position.set(0, FIELD_GOAL_HEIGHT, 0)
        crossbar.castShadow = true
        this._mesh.add(crossbar)
    }

    get mesh() {
        return this._mesh
    }
}
