export class Overlay {
    overlayElement: HTMLElement

    constructor() {
        this.overlayElement = document.getElementById('overlay') as HTMLElement

        if (!this.overlayElement) {
            console.error('Overlay element not found!')
            return
        }

        this.createScore()
    }

    createScore() {
        fetch('vibes-fc/overlay/score.html')
            .then((response) => response.text())
            .then((html) => {
                const scoreElement = document.createElement('div')
                scoreElement.innerHTML = html
                this.overlayElement.appendChild(scoreElement)
            })
    }
}

new Overlay()
