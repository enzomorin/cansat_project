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
    const selected = portSelect.value?.trim()
    if (!selected) {
        statusSP.textContent = 'Sélectionnez un port valide'
        return
    }

    statusSP.textContent = 'Connexion en cours...'

    try {
        const result = await window.api.connectPort(selected) 
        if (result.connected) {
            statusSP.textContent = `✅ Connecté à ${selected}`
            setTimeout(() => window.close(), 500)
        } else statusSP.textContent = '❌ Impossible de se connecter'
    } catch (err) {
        statusSP.textContent = `❌ Erreur : ${String(err)}`
    }
})

// fermer sans connexion
closeButton.addEventListener('click', () => {
    window.close()
})

// initialise la liste des ports au chargement
listPorts()