import { Vector3 } from 'three'
import { FIELD_LENGTH, FIELD_WIDTH } from '../constants'

const MINIMAP_SIZE = { width: 176, height: 120 }

export class Minimap {
    private canvas!: HTMLCanvasElement
    private ctx!: CanvasRenderingContext2D

    constructor() {
        const tryAttachCanvas = () => {
            if (document.getElementById('mini-map')) {
                this.canvas = document.getElementById('mini-map') as HTMLCanvasElement
                this.canvas.width = MINIMAP_SIZE.width
                this.canvas.height = MINIMAP_SIZE.height
                this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
            } else {
                setTimeout(tryAttachCanvas, 100)
            }
        }

        tryAttachCanvas()
    }

    private _worldToCanvas(x: number, z: number): [number, number] {
        // Convert world coordinates to canvas coordinates
        const canvasX = (x / FIELD_WIDTH) * MINIMAP_SIZE.width + MINIMAP_SIZE.width / 2
        const canvasY = (z / FIELD_LENGTH) * MINIMAP_SIZE.height + MINIMAP_SIZE.height / 2
        return [canvasX, canvasY]
    }

    update(playerPosition: Vector3, playerRotation: number, ballPosition: Vector3) {
        if (!this.ctx) {
            return
        }
        // Clear the canvas
        this.ctx.clearRect(0, 0, MINIMAP_SIZE.width, MINIMAP_SIZE.height)

        // Draw player marker (triangle)
        const [playerX, playerY] = this._worldToCanvas(playerPosition.x, playerPosition.z)
        this.ctx.save()
        this.ctx.translate(playerX, playerY)
        this.ctx.rotate(playerRotation)

        this.ctx.beginPath()
        this.ctx.moveTo(0, -4) // Top point
        this.ctx.lineTo(3, 4) // Bottom right
        this.ctx.lineTo(-3, 4) // Bottom left
        this.ctx.closePath()

        this.ctx.fillStyle = '#0000ff'
        this.ctx.fill()
        this.ctx.restore()

        // Draw ball marker (circle)
        const [ballX, ballY] = this._worldToCanvas(ballPosition.x, ballPosition.z)
        this.ctx.beginPath()
        this.ctx.arc(ballX, ballY, 2, 0, Math.PI * 2)
        this.ctx.fillStyle = '#ff0000'
        this.ctx.fill()
    }
}
