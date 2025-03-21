import { BoxGeometry, CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'

export class Scoreboard {
    private _mesh: Group
    private _canvas: HTMLCanvasElement
    private _context: CanvasRenderingContext2D
    private _texture: CanvasTexture
    private _scores = { red: 0, blue: 0 }

    constructor() {
        this._mesh = new Group()

        // Create canvas for the scoreboard
        this._canvas = document.createElement('canvas')
        this._canvas.width = 512
        this._canvas.height = 256
        this._context = this._canvas.getContext('2d')!
        this._texture = new CanvasTexture(this._canvas)

        // Create the billboard
        const boardGeometry = new PlaneGeometry(10, 5)
        const boardMaterial = new MeshBasicMaterial({ map: this._texture })
        const board = new Mesh(boardGeometry, boardMaterial)
        board.position.set(0, 6, 0) // Position above ground
        this._mesh.add(board)

        // Add a simple frame
        const frameGeometry = new BoxGeometry(10.5, 5.5, 0.5)
        const frameMaterial = new MeshBasicMaterial({ color: 0x333333 })
        const frame = new Mesh(frameGeometry, frameMaterial)
        frame.position.set(0, 6, -0.25)
        this._mesh.add(frame)

        // Initial render
        this.updateDisplay()
    }

    get mesh() {
        return this._mesh
    }

    incrementScore(team: 'red' | 'blue') {
        this._scores[team]++
        this.updateDisplay()
    }

    private updateDisplay() {
        const ctx = this._context
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, this._canvas.width, this._canvas.height)

        // Draw team names
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Red team
        ctx.fillStyle = '#ff0000'
        ctx.fillText('RED', this._canvas.width * 0.25, this._canvas.height * 0.3)
        ctx.fillText(this._scores.red.toString(), this._canvas.width * 0.25, this._canvas.height * 0.7)

        // Separator
        ctx.fillStyle = '#ffffff'
        ctx.fillText('-', this._canvas.width * 0.5, this._canvas.height * 0.5)

        // Blue team
        ctx.fillStyle = '#0000ff'
        ctx.fillText('BLUE', this._canvas.width * 0.75, this._canvas.height * 0.3)
        ctx.fillText(this._scores.blue.toString(), this._canvas.width * 0.75, this._canvas.height * 0.7)

        // Update texture
        this._texture.needsUpdate = true
    }
}
