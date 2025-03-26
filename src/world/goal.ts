import { BufferGeometry, CylinderGeometry, Float32BufferAttribute, Group, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial } from 'three'
import { FIELD_GOAL_HEIGHT, FIELD_GOAL_POST_RADIUS, FIELD_GOAL_WIDTH, MATH_PI_HALF } from '../constants'

export class Goal {
    private _mesh: Group

    constructor() {
        this._mesh = new Group()

        // Goal posts
        const postGeometry = new CylinderGeometry(FIELD_GOAL_POST_RADIUS, FIELD_GOAL_POST_RADIUS, FIELD_GOAL_HEIGHT, 8)
        const postMaterial = new MeshBasicMaterial({ color: 0xffffff })

        // Left post
        const leftPost = new Mesh(postGeometry, postMaterial)
        leftPost.position.set(-FIELD_GOAL_WIDTH / 2, FIELD_GOAL_HEIGHT / 2, 0)
        this._mesh.add(leftPost)

        // Right post
        const rightPost = new Mesh(postGeometry, postMaterial)
        rightPost.position.set(FIELD_GOAL_WIDTH / 2, FIELD_GOAL_HEIGHT / 2, 0)
        this._mesh.add(rightPost)

        // Crossbar
        const crossbarGeometry = new CylinderGeometry(FIELD_GOAL_POST_RADIUS, FIELD_GOAL_POST_RADIUS, FIELD_GOAL_WIDTH + FIELD_GOAL_POST_RADIUS * 2, 8)
        const crossbar = new Mesh(crossbarGeometry, postMaterial)
        crossbar.rotation.z = MATH_PI_HALF
        crossbar.position.set(0, FIELD_GOAL_HEIGHT, 0)
        this._mesh.add(crossbar)

        // Add net
        this.addNet()
    }

    get mesh() {
        return this._mesh
    }

    private createGridGeometry(width: number, height: number, segmentsX: number, segmentsY: number): BufferGeometry {
        const vertices: number[] = []
        const indices: number[] = []

        // Create vertices for all points in the grid
        for (let y = 0; y <= segmentsY; y++) {
            for (let x = 0; x <= segmentsX; x++) {
                const xPos = (x / segmentsX) * width - width / 2
                const yPos = (y / segmentsY) * height - height / 2
                vertices.push(xPos, yPos, 0)
            }
        }

        // Create horizontal lines
        for (let y = 0; y <= segmentsY; y++) {
            for (let x = 0; x < segmentsX; x++) {
                const currentPoint = y * (segmentsX + 1) + x
                indices.push(currentPoint, currentPoint + 1)
            }
        }

        // Create vertical lines
        for (let x = 0; x <= segmentsX; x++) {
            for (let y = 0; y < segmentsY; y++) {
                const currentPoint = y * (segmentsX + 1) + x
                const nextPoint = currentPoint + (segmentsX + 1)
                indices.push(currentPoint, nextPoint)
            }
        }

        const geometry = new BufferGeometry()
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
        geometry.setIndex(indices)

        return geometry
    }

    private addNet() {
        const netDepth = FIELD_GOAL_HEIGHT * 0.8 // Net depth
        const netMaterial = new LineBasicMaterial({ color: 0xd3d3d3, linewidth: 1 })

        // Back wall
        const backWallGeometry = this.createGridGeometry(FIELD_GOAL_WIDTH, FIELD_GOAL_HEIGHT, 15, 10)
        const backWall = new LineSegments(backWallGeometry, netMaterial)
        backWall.position.set(0, FIELD_GOAL_HEIGHT / 2, -netDepth)
        this._mesh.add(backWall)

        // Top wall
        const topWallGeometry = this.createGridGeometry(FIELD_GOAL_WIDTH, netDepth, 15, 8)
        const topWall = new LineSegments(topWallGeometry, netMaterial)
        topWall.position.set(0, FIELD_GOAL_HEIGHT, -netDepth / 2)
        topWall.rotation.x = -MATH_PI_HALF
        this._mesh.add(topWall)

        // Left wall
        const sideWallGeometry = this.createGridGeometry(netDepth, FIELD_GOAL_HEIGHT, 8, 10)
        const leftWall = new LineSegments(sideWallGeometry, netMaterial)
        leftWall.position.set(-FIELD_GOAL_WIDTH / 2, FIELD_GOAL_HEIGHT / 2, -netDepth / 2)
        leftWall.rotation.y = MATH_PI_HALF
        this._mesh.add(leftWall)

        // Right wall
        const rightWall = new LineSegments(sideWallGeometry, netMaterial)
        rightWall.position.set(FIELD_GOAL_WIDTH / 2, FIELD_GOAL_HEIGHT / 2, -netDepth / 2)
        rightWall.rotation.y = -MATH_PI_HALF
        this._mesh.add(rightWall)
    }
}
