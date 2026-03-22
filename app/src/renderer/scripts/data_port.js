const MAX_LINES = 500

export default function initSerialTerminal() {
    const serialContainer = document.getElementById("serial-container")
    const stopBtn         = document.getElementById("stop-mission-btn")
    const cancelBtn       = document.getElementById("cancel-mission-btn")

    const cursor = document.createElement("span")
    cursor.classList.add("cursor")
    cursor.textContent = "_"
    serialContainer.appendChild(cursor)

    window.serialDataHistory ??= []

    function addSerialData(data) {
        if (!data) return
        window.serialDataHistory.push(data)
        if (window.serialDataHistory.length > MAX_LINES)
            window.serialDataHistory.shift()

        cursor.remove()
        const line = document.createElement("div")
        line.textContent = data
        serialContainer.appendChild(line)
        serialContainer.appendChild(cursor)
        serialContainer.scrollTop = serialContainer.scrollHeight
    }

    function resetTerminal() {
        window.serialDataHistory = []
        serialContainer.innerHTML = ""
        serialContainer.appendChild(cursor)
    }

    window.api.onSerialData(addSerialData)

    stopBtn?.addEventListener("click", async () => {
        if (!window.missionManager.isActive()) return
        await window.missionManager.endMission()
        window.notif.success("Mission terminée", null, 3000)
        resetTerminal()
        window.page.change("report")
    })

    cancelBtn?.addEventListener("click", async () => {
        if (!window.missionManager.isActive()) return
        await window.missionManager.cancelMission(true)
        window.notif.info("Mission annulée", null, 3000)
        resetTerminal()
        window.page.change("home")
    })
}