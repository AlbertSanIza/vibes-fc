fetch('vibes-fc/overlay/score.html')
    .then((response) => response.text())
    .then((html) => {
        const scoreOverlay = document.getElementById('score-overlay')
        if (scoreOverlay) {
            scoreOverlay.innerHTML = html
        }
    })
