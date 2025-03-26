export class Overlay {
    overlayElement: HTMLElement

    constructor() {
        this.overlayElement = document.getElementById('overlay') as HTMLElement
        if (!this.overlayElement) {
            console.error('Overlay element not found!')
            return
        }

        this.append('score.html')
        this.append('mini-map.html')
    }

    append(src: string) {
        const basePath = window.location.hostname === 'localhost' ? 'vibes-fc/' : ''
        fetch(`${basePath}${src}`)
            .then((response) => response.text())
            .then((html) => (this.overlayElement.innerHTML += html))
            .catch((error) => console.error('Error:', error))
    }
}
