import { CircleGeometry, CylinderGeometry, DoubleSide, Group, Mesh, MeshStandardMaterial, PlaneGeometry, RingGeometry } from 'three'

import {
    FIELD_EXTENDED_LENGTH,
    FIELD_EXTENDED_WIDTH,
    FIELD_LENGTH,
    FIELD_LENGTH_HALF,
    FIELD_LINE_COLOR,
    FIELD_LINE_THICKNESS,
    FIELD_WIDTH,
    FIELD_WIDTH_HALF,
    MATH_PI_HALF
} from '../constants'

export class Field {
    private _mesh: Group

    constructor() {
        this._mesh = new Group()

        // Main Field
        const mainFieldGeometry = new PlaneGeometry(FIELD_EXTENDED_WIDTH, FIELD_EXTENDED_LENGTH)
        const mainFieldMaterial = new MeshStandardMaterial({ color: 0x2e8b57 }) // Forest green
        const mainField = new Mesh(mainFieldGeometry, mainFieldMaterial)
        mainField.rotation.x = -MATH_PI_HALF
        mainField.position.y = 0.01
        mainField.receiveShadow = true
        this._mesh.add(mainField)

        this.createFieldLine(FIELD_WIDTH, FIELD_LINE_THICKNESS, { x: 0, z: FIELD_LENGTH_HALF }) // Outer Line North
        this.createFieldLine(FIELD_WIDTH, FIELD_LINE_THICKNESS, { x: 0, z: -FIELD_LENGTH_HALF }) // Outer Line South
        this.createFieldLine(FIELD_LINE_THICKNESS, FIELD_LENGTH + FIELD_LINE_THICKNESS, { x: -FIELD_WIDTH_HALF, z: 0 }) // Outer Line East
        this.createFieldLine(FIELD_LINE_THICKNESS, FIELD_LENGTH + FIELD_LINE_THICKNESS, { x: FIELD_WIDTH_HALF, z: 0 }) // Outer Line West
        this.createFieldLine(FIELD_WIDTH, FIELD_LINE_THICKNESS, { x: 0, z: 0 }) // Center Line

        this.createQuarterCircle({ x: -FIELD_WIDTH_HALF, z: FIELD_LENGTH_HALF }, 0) // Quarter Circle Northeast
        this.createQuarterCircle({ x: FIELD_WIDTH_HALF, z: FIELD_LENGTH_HALF }, MATH_PI_HALF) // Quarter Circle Northwest
        this.createQuarterCircle({ x: -FIELD_WIDTH_HALF, z: -FIELD_LENGTH_HALF }, -MATH_PI_HALF) // Quarter Circle Southeast
        this.createQuarterCircle({ x: FIELD_WIDTH_HALF, z: -FIELD_LENGTH_HALF }, Math.PI) // Quarter Circle Southwest

        // Center Circle
        const centerCircleRadius = 9.15 / 2
        const centerCircleGeometry = new RingGeometry(centerCircleRadius - FIELD_LINE_THICKNESS / 2, centerCircleRadius + FIELD_LINE_THICKNESS / 2, 32)
        const centerCircleMaterial = new MeshStandardMaterial({ color: FIELD_LINE_COLOR })
        const centerCircle = new Mesh(centerCircleGeometry, centerCircleMaterial)
        centerCircle.rotation.x = -MATH_PI_HALF
        centerCircle.position.y = 0.02
        this._mesh.add(centerCircle)

        this.createSpot({ x: 0, z: 0 }) // Center Spot
        this.createSpot({ x: 0, z: FIELD_LENGTH_HALF - 11 }) // Penalty Spot North
        this.createSpot({ x: 0, z: -FIELD_LENGTH_HALF + 11 }) // Penalty Spot South

        // Penalty Area North
        this.createFieldLine(40.3, FIELD_LINE_THICKNESS, { x: 0, z: FIELD_LENGTH_HALF - 16.5 })
        this.createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, { x: 20.15, z: FIELD_LENGTH_HALF - 8.25 })
        this.createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, { x: -20.15, z: FIELD_LENGTH_HALF - 8.25 })
        // Goal Area North
        this.createFieldLine(18.32, FIELD_LINE_THICKNESS, { x: 0, z: FIELD_LENGTH_HALF - 5.5 })
        this.createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, { x: 9.16, z: FIELD_LENGTH_HALF - 2.75 })
        this.createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, { x: -9.16, z: FIELD_LENGTH_HALF - 2.75 })
        // Penalty South
        this.createFieldLine(40.3, FIELD_LINE_THICKNESS, { x: 0, z: -FIELD_LENGTH_HALF + 16.5 })
        this.createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, { x: 20.15, z: -FIELD_LENGTH_HALF + 8.25 })
        this.createFieldLine(FIELD_LINE_THICKNESS, 16.5 + FIELD_LINE_THICKNESS, { x: -20.15, z: -FIELD_LENGTH_HALF + 8.25 })
        // Penalty Box South
        this.createFieldLine(18.32, FIELD_LINE_THICKNESS, { x: 0, z: -FIELD_LENGTH_HALF + 5.5 })
        this.createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, { x: 9.16, z: -FIELD_LENGTH_HALF + 2.75 })
        this.createFieldLine(FIELD_LINE_THICKNESS, 5.5 + FIELD_LINE_THICKNESS, { x: -9.16, z: -FIELD_LENGTH_HALF + 2.75 })

        this.createCornerFlagPole({ x: FIELD_WIDTH_HALF, z: FIELD_LENGTH_HALF }) // Northeast corner
        this.createCornerFlagPole({ x: -FIELD_WIDTH_HALF, z: FIELD_LENGTH_HALF }) // Northwest corner
        this.createCornerFlagPole({ x: FIELD_WIDTH_HALF, z: -FIELD_LENGTH_HALF }) // Southeast corner
        this.createCornerFlagPole({ x: -FIELD_WIDTH_HALF, z: -FIELD_LENGTH_HALF }) // Southwest corner

        this.createCornerFlagPole({ x: 0, z: 0 }) // Southwest corner
    }

    get mesh() {
        return this._mesh
    }

    private createFieldLine(width: number, length: number, position: { x: number; z: number }) {
        const fieldLineGeometry = new PlaneGeometry(width, length)
        const fieldLineMaterial = new MeshStandardMaterial({ color: FIELD_LINE_COLOR })
        const fieldLine = new Mesh(fieldLineGeometry, fieldLineMaterial)
        fieldLine.rotation.x = -MATH_PI_HALF
        fieldLine.position.set(position.x, 0.02, position.z)
        fieldLine.receiveShadow = true
        this._mesh.add(fieldLine)
    }

    private createQuarterCircle = (position: { x: number; z: number }, rotation: number) => {
        const radius = 1
        const quarterCircleGeometry = new RingGeometry(radius - FIELD_LINE_THICKNESS / 2, radius + FIELD_LINE_THICKNESS / 2, 32, 1, 0, MATH_PI_HALF)
        const quarterCircleMaterial = new MeshStandardMaterial({ color: FIELD_LINE_COLOR })
        const quarterCircle = new Mesh(quarterCircleGeometry, quarterCircleMaterial)
        quarterCircle.rotation.x = -MATH_PI_HALF
        quarterCircle.rotation.z = rotation
        quarterCircle.position.set(position.x, 0.02, position.z)
        this._mesh.add(quarterCircle)
    }

    private createSpot = (position: { x: number; z: number }) => {
        const centerSpotGeometry = new CircleGeometry(FIELD_LINE_THICKNESS, 32)
        const centerSpotMaterial = new MeshStandardMaterial({ color: FIELD_LINE_COLOR })
        const centerSpot = new Mesh(centerSpotGeometry, centerSpotMaterial)
        centerSpot.rotation.x = -MATH_PI_HALF
        centerSpot.position.set(position.x, 0.02, position.z)
        this._mesh.add(centerSpot)
    }

    private createCornerFlagPole = (position: { x: number; z: number }) => {
        const cornerFlagPole = new Group()
        const cornerPoleGeometry = new CylinderGeometry(0.05, 0.05, 1.5)
        const cornerPoleMaterial = new MeshStandardMaterial({ color: 0xffffff })
        const cornerPole = new Mesh(cornerPoleGeometry, cornerPoleMaterial)
        cornerPole.position.set(position.x, 0.75, position.z)
        cornerPole.castShadow = true
        cornerFlagPole.add(cornerPole)
        const cornerFlagGeometry = new PlaneGeometry(0.4, 0.3)
        const cornerFlagMaterial = new MeshStandardMaterial({ color: 0xff0000, side: DoubleSide })
        const cornerFlag = new Mesh(cornerFlagGeometry, cornerFlagMaterial)
        cornerFlag.position.set(position.x - 0.2, 1.3, position.z)
        cornerFlag.castShadow = true
        cornerFlagPole.add(cornerFlag)
        this._mesh.add(cornerFlagPole)
    }
}
