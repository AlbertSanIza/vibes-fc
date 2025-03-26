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
        const canvasX = (z / FIELD_LENGTH) * MINIMAP_SIZE.width + MINIMAP_SIZE.width / 2
        const canvasY = -(x / FIELD_WIDTH) * MINIMAP_SIZE.height + MINIMAP_SIZE.height / 2
        return [canvasX, canvasY]
    }

    update(playerPosition: Vector3, playerRotation: number, ballPosition: Vector3, playerColor: number) {
        if (!this.ctx) {
            return
        }
        this.ctx.clearRect(0, 0, MINIMAP_SIZE.width, MINIMAP_SIZE.height)

        // Draw player marker (triangle)
        const [playerX, playerY] = this._worldToCanvas(playerPosition.x, playerPosition.z)
        this.ctx.save()
        this.ctx.translate(playerX, playerY)
        this.ctx.rotate(-playerRotation)

        this.ctx.beginPath()
        this.ctx.moveTo(-3.5, 0) // Left point
        this.ctx.lineTo(3.5, -3) // Top right
        this.ctx.lineTo(3.5, 3) // Bottom right
        this.ctx.closePath()

        // Convert hex color to CSS color string
        const r = (playerColor >> 16) & 255
        const g = (playerColor >> 8) & 255
        const b = playerColor & 255

        // First draw the white stroke
        this.ctx.strokeStyle = 'white'
        this.ctx.lineWidth = 2
        this.ctx.stroke()

        // Then fill with player color
        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        this.ctx.fill()

        this.ctx.restore()

        // Draw ball marker (circle)
        const [ballX, ballY] = this._worldToCanvas(ballPosition.x, ballPosition.z)
        this.ctx.beginPath()
        this.ctx.arc(ballX, ballY, 2, 0, Math.PI * 2)
        this.ctx.fillStyle = 'yellow'
        this.ctx.fill()
    }
}
