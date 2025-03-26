export class Overlay {
    overlayElement: HTMLElement

    constructor() {
        this.overlayElement = document.getElementById('overlay') as HTMLElement
        if (!this.overlayElement) {
            console.error('Overlay element not found!')
            return
        }

        this.append('overlay/score.html')
        this.append('overlay/mini-map.html')
    }

    append(src: string) {
        fetch(`vibes-fc/${src}`)
            .then((response) => response.text())
            .then((html) => (this.overlayElement.innerHTML += html))
            .catch((error) => console.error('Error:', error))
    }
}
