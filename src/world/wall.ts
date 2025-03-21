import { BoxGeometry, Group, Mesh, MeshNormalMaterial } from 'three'
import { CSG } from 'three-csg-ts'
import { FIELD_EXTENDED_LENGTH, FIELD_EXTENDED_WIDTH } from '../constants'

export class Wall {
    private _mesh: Group

    constructor() {
        this._mesh = new Group()
        const outerGeometry = new BoxGeometry(FIELD_EXTENDED_WIDTH + 1, 3, FIELD_EXTENDED_LENGTH + 1)
        const outerMaterial = new MeshNormalMaterial()
        const outer = new Mesh(outerGeometry, outerMaterial)
        const innerGeometry = new BoxGeometry(FIELD_EXTENDED_WIDTH, 3, FIELD_EXTENDED_LENGTH)
        const innerMaterial = new MeshNormalMaterial()
        const innerBox = new Mesh(innerGeometry, innerMaterial)
        outer.updateMatrix()
        innerBox.updateMatrix()
        this._mesh.add(CSG.subtract(outer, innerBox))
    }

    get mesh() {
        return this._mesh
    }
}
