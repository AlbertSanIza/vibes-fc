import { BoxGeometry, Color, EdgesGeometry, Group, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial } from 'three'
import { CSG } from 'three-csg-ts'

import { FIELD_EXTENDED_LENGTH, FIELD_EXTENDED_WIDTH } from '../constants'

export class Wall {
    private _mesh: Group

    constructor() {
        this._mesh = new Group()
        const outerGeometry = new BoxGeometry(FIELD_EXTENDED_WIDTH + 1, 2, FIELD_EXTENDED_LENGTH + 1)
        const outerMaterial = new MeshBasicMaterial({ color: 0x808080 })
        const outer = new Mesh(outerGeometry, outerMaterial)
        const innerGeometry = new BoxGeometry(FIELD_EXTENDED_WIDTH, 2, FIELD_EXTENDED_LENGTH)
        const innerMaterial = new MeshBasicMaterial({ color: 0x808080 })
        const innerBox = new Mesh(innerGeometry, innerMaterial)
        outer.updateMatrix()
        innerBox.updateMatrix()
        const wall = CSG.subtract(outer, innerBox)
        this._mesh.add(wall)
        const edges = new EdgesGeometry(wall.geometry)
        const lineMaterial = new LineBasicMaterial({ color: new Color(0x000000), linewidth: 1 })
        const wireframe = new LineSegments(edges, lineMaterial)
        this._mesh.add(wireframe)
    }

    get mesh() {
        return this._mesh
    }
}
