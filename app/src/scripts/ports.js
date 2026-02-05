const portSelect = document.getElementById('port-select')
const connectButton = document.getElementById('connect-btn')
const closeButton = document.getElementById('close-btn')
const statusSP = document.getElementById('status')

// lister les ports série
async function listPorts() {
    const ports = await window.api.listPorts()
    ports.forEach(port => {
        const option = document.createElement('option')
        option.value = port.path
        option.textContent = `${port.path} - ${port.manufacturer || 'Inconnu'}`
        portSelect.appendChild(option)
    })
}

// connexion au port sélectionné
connectButton.addEventListener('click', async () => {
    const selected = portSelect.value
    if (!selected) return

    statusSP.textContent = 'Connexion en cours...'

    try {
        await window.api.connectPort(selected)
        window.close()
    } catch (err) {
        statusSP.textContent = `❌ ${String(err)}`
    }
})

// fermer sans connexion
closeButton.addEventListener('click', () => {
    window.close()
})

// initialise la liste des ports au chargement
listPorts()