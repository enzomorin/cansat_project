export default function () {
    const container = document.getElementById('data-serial')

    // buffer global
    window.serialDataHistory ??= []

    window.api.onSerialData(data => {
        const now = new Date().toLocaleTimeString()
        const line = `[${now}] ${data}`

        window.serialDataHistory.push(line)
        container.textContent += line + '\n'
        container.scrollTop = container.scrollHeight
    })
}