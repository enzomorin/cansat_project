export default async function initAntennaPage() {
    const scanBtn   = document.getElementById("scan-connect")
    const importBtn = document.getElementById("import-mission")

    scanBtn?.addEventListener("click", () => window.api.openPortWindow())

    importBtn?.addEventListener("click", async () => {
        const filePath = await window.api.openCSVFile()
        if (!filePath) return

        importBtn.disabled = true
        try {
            await window.missionManager.startMission("csv", "import", filePath)
            window.notif.success("Fichier importé", null, 3000)
        } finally {
            importBtn.disabled = false
        }
    })

    if (window.missionManager?.isActive()) {
        const type = window.missionManager.getCurrentMissionType()
        window.page.change(type === "serial" ? "data_port" : "report")
        window.notif.info("Mission active restaurée", null, 2000)
    }
}