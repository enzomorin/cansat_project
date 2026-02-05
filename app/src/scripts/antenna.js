const scanButton = document.getElementById('scan-connect')

let hasChangedPage = false

window.serialDataHistory ??= []

scanButton?.addEventListener('click', () => {
    // Ouvre la petite fenêtre pour scanner les ports
    window.api.openPortWindow()
})
