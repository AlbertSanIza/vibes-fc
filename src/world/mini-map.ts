import { CanvasTexture, Group, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene, Vector3, WebGLRenderer } from 'three'
import { FIELD_LENGTH, FIELD_WIDTH } from '../constants'

export class Minimap {
    private _mesh: Group
    private _camera: OrthographicCamera
    private _scene: Scene
    private _renderer: WebGLRenderer
    private _canvas: HTMLCanvasElement
    private _playerMarker: Mesh
    private _ballMarker: Mesh
    private _minimapMesh: Mesh
    private readonly MINIMAP_SIZE = { width: 200, height: 150 }

    constructor() {
        this._mesh = new Group()

        // Create a separate scene for the minimap
        this._scene = new Scene()

        // Create an orthographic camera for top-down view
        const aspect = FIELD_WIDTH / FIELD_LENGTH
        const cameraHeight = FIELD_LENGTH
        this._camera = new OrthographicCamera((-cameraHeight * aspect) / 2, (cameraHeight * aspect) / 2, cameraHeight / 2, -cameraHeight / 2, 1, 1000)
        this._camera.position.set(0, 100, 0)
        this._camera.lookAt(0, 0, 0)

        // Create canvas and renderer for the minimap
        this._canvas = document.createElement('canvas')
        this._canvas.width = this.MINIMAP_SIZE.width
        this._canvas.height = this.MINIMAP_SIZE.height
        this._renderer = new WebGLRenderer({ canvas: this._canvas, alpha: true })
        this._renderer.setSize(this.MINIMAP_SIZE.width, this.MINIMAP_SIZE.height)

        // Create the field outline
        const fieldGeometry = new PlaneGeometry(FIELD_WIDTH, FIELD_LENGTH)
        const fieldMaterial = new MeshBasicMaterial({ color: 0x3c8f40 }) // Green field
        const field = new Mesh(fieldGeometry, fieldMaterial)
        field.rotation.x = -Math.PI / 2
        this._scene.add(field)

        // Create field lines
        const linesGeometry = new PlaneGeometry(FIELD_WIDTH - 1, FIELD_LENGTH - 1)
        const linesMaterial = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
        const lines = new Mesh(linesGeometry, linesMaterial)
        lines.rotation.x = -Math.PI / 2
        lines.position.y = 0.1
        this._scene.add(lines)

        // Create player marker (blue triangle)
        const playerGeometry = new PlaneGeometry(4, 4)
        const playerMaterial = new MeshBasicMaterial({ color: 0x0000ff })
        this._playerMarker = new Mesh(playerGeometry, playerMaterial)
        this._playerMarker.rotation.x = -Math.PI / 2
        this._playerMarker.position.y = 0.2
        this._scene.add(this._playerMarker)

        // Create ball marker (red dot)
        const ballGeometry = new PlaneGeometry(2, 2)
        const ballMaterial = new MeshBasicMaterial({ color: 0xff0000 })
        this._ballMarker = new Mesh(ballGeometry, ballMaterial)
        this._ballMarker.rotation.x = -Math.PI / 2
        this._ballMarker.position.y = 0.2
        this._scene.add(this._ballMarker)

        // Create the minimap display mesh
        const minimapGeometry = new PlaneGeometry(this.MINIMAP_SIZE.width / 40, this.MINIMAP_SIZE.height / 40)
        const minimapTexture = new CanvasTexture(this._canvas)
        const minimapMaterial = new MeshBasicMaterial({
            map: minimapTexture,
            transparent: true,
            opacity: 0.9
        })
        this._minimapMesh = new Mesh(minimapGeometry, minimapMaterial)
        this._minimapMesh.position.set(0, 0, 0)
        this._mesh.add(this._minimapMesh)

        // Position the minimap in the bottom center of the screen
        this.updatePosition()
        window.addEventListener('resize', () => this.updatePosition())
    }

    get mesh() {
        return this._mesh
    }

    updatePosition() {
        // Position the minimap in the bottom center of the screen
        const y = -window.innerHeight / window.innerWidth + 0.2 // Bottom with small margin
        this._mesh.position.set(0, y, -1)
    }

    update(playerPosition: Vector3, playerRotation: number, ballPosition: Vector3) {
        // Update player marker position and rotation
        this._playerMarker.position.x = playerPosition.x
        this._playerMarker.position.z = playerPosition.z
        this._playerMarker.rotation.y = playerRotation

        // Update ball marker position
        this._ballMarker.position.x = ballPosition.x
        this._ballMarker.position.z = ballPosition.z

        // Render the minimap
        this._renderer.render(this._scene, this._camera)
        ;(this._minimapMesh.material as MeshBasicMaterial).map!.needsUpdate = true
    }
}
