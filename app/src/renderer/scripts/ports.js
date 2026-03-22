async function initPortsPage() {
    const select     = document.getElementById("port-select")
    const connectBtn = document.getElementById("connect-btn")
    const closeBtn   = document.getElementById("close-btn")
    const status     = document.getElementById("status")

    async function loadPorts() {
        try {
            const ports = await window.api.listPorts()
            select.innerHTML = `<option value="">-- 🔌 Select a port --</option>`

            if (!ports.length) {
                status.textContent = "⚠️ Aucun port trouvé"
                return
            }

            ports.forEach(p => {
                const option = document.createElement("option")
                option.value = p.path
                option.textContent = `🔌 ${p.path} ${p.manufacturer || ""}`.trim()
                select.appendChild(option)
            })
        } catch {
            status.textContent = "❌ Erreur lors de la liste des ports"
        }
    }

    connectBtn.onclick = async () => {
        const path = select.value
        if (!path) { status.textContent = "⚠️ Sélectionner un port"; return }

        status.textContent = "⏳ Connexion en cours..."
        connectBtn.disabled = true

        try {
            const res = await window.api.connectPort(path)

            if (res.connected) {
                status.textContent = "✅ Connecté !"
                // Wait 2s then close the window
                setTimeout(() => window.close(), 1000)
            } else {
                status.textContent = `❌ Échec de connexion`
                connectBtn.disabled = false
            }
        } catch {
            status.textContent = "❌ Erreur inattendue"
            connectBtn.disabled = false
        }
    }

    closeBtn.onclick = () => window.close()

    await loadPorts()
}

initPortsPage()
export default initPortsPage