import { Vector3 } from 'three'
import { FIELD_LENGTH, FIELD_WIDTH } from '../constants'

export class Minimap {
    private _canvas: HTMLCanvasElement
    private _ctx: CanvasRenderingContext2D
    private readonly MINIMAP_SIZE = { width: 176, height: 120 } // Matches the HTML dimensions

    constructor() {
        this._canvas = document.createElement('canvas')
        this._canvas.width = this.MINIMAP_SIZE.width
        this._canvas.height = this.MINIMAP_SIZE.height
        this._ctx = this._canvas.getContext('2d')!

        // Add the canvas to the mini-map container in the HTML
        const container = document.querySelector('.relative.h-30.w-\\[176px\\]')
        if (container) {
            this._canvas.style.position = 'absolute'
            this._canvas.style.top = '0'
            this._canvas.style.left = '0'
            this._canvas.style.width = '100%'
            this._canvas.style.height = '100%'
            container.appendChild(this._canvas)
        }
    }

    private _worldToCanvas(x: number, z: number): [number, number] {
        // Convert world coordinates to canvas coordinates
        const canvasX = (x / FIELD_WIDTH) * this.MINIMAP_SIZE.width + this.MINIMAP_SIZE.width / 2
        const canvasY = (z / FIELD_LENGTH) * this.MINIMAP_SIZE.height + this.MINIMAP_SIZE.height / 2
        return [canvasX, canvasY]
    }

    update(playerPosition: Vector3, playerRotation: number, ballPosition: Vector3) {
        // Clear the canvas
        this._ctx.clearRect(0, 0, this.MINIMAP_SIZE.width, this.MINIMAP_SIZE.height)

        // Draw player marker (triangle)
        const [playerX, playerY] = this._worldToCanvas(playerPosition.x, playerPosition.z)
        this._ctx.save()
        this._ctx.translate(playerX, playerY)
        this._ctx.rotate(playerRotation)

        this._ctx.beginPath()
        this._ctx.moveTo(0, -4) // Top point
        this._ctx.lineTo(3, 4) // Bottom right
        this._ctx.lineTo(-3, 4) // Bottom left
        this._ctx.closePath()

        this._ctx.fillStyle = '#0000ff'
        this._ctx.fill()
        this._ctx.restore()

        // Draw ball marker (circle)
        const [ballX, ballY] = this._worldToCanvas(ballPosition.x, ballPosition.z)
        this._ctx.beginPath()
        this._ctx.arc(ballX, ballY, 2, 0, Math.PI * 2)
        this._ctx.fillStyle = '#ff0000'
        this._ctx.fill()
    }
}
