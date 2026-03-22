export default async function initReportPage() {
    const missionNameInput  = document.getElementById("mission-name")
    const missionLocationInput = document.getElementById("mission-location")
    const radiusSlider      = document.getElementById("mission-radius")
    const radiusValue       = document.getElementById("radius-value")
    const commitBtn         = document.getElementById("commit-report-btn")
    const cancelBtnReport   = document.getElementById("cancel-report-btn")

    const state = window.missionManager.getState()
    const data  = window.missionManager.getReport() ?? { name: "", location: "" }

    missionNameInput.value     = data.name ?? ""
    missionLocationInput.value = data.location ?? ""
    radiusSlider.value         = window.missionManager.getRadius()
    radiusValue.textContent    = radiusSlider.value + " m"

    if (state?.csvPath) {
        const { loadCSVViewer } = await window.csvViewer.load()
        loadCSVViewer({
            containerId: "csv-viewer",
            getCSV: () => window.api.readCSVFile(state.csvPath)
        })
    }

    await window.trackerMap.initMap("map-container")

    if (data.location) {
        const [lat, lon] = data.location.split(",").map(Number)
        if (!isNaN(lat) && !isNaN(lon))
            await window.trackerMap.setMissionLocation(lat, lon, window.missionManager.getRadius())
    }

    // ---------- INPUT LISTENERS ----------
    missionNameInput.addEventListener("input", async () => {
        await window.missionManager.updateReport({ name: missionNameInput.value })
    })

    missionLocationInput.addEventListener("input", async () => {
        await window.missionManager.updateReport({ location: missionLocationInput.value })
    })

    missionLocationInput.addEventListener("change", () => {
        const [lat, lon] = missionLocationInput.value.split(",").map(Number)
        if (!isNaN(lat) && !isNaN(lon))
            window.trackerMap.setMissionLocation(lat, lon, window.missionManager.getRadius())
    })

    radiusSlider.addEventListener("input", async () => {
        const radius = parseInt(radiusSlider.value)
        radiusValue.textContent = radius + " m"
        window.trackerMap.setRadius(radius)
        await window.missionManager.updateReport({ radius })
    })

    window.addEventListener("map:location-selected", async e => {
        const { lat, lon } = e.detail
        const value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`
        missionLocationInput.value = value
        await window.missionManager.updateReport({ location: value })
    })

    // ---------- COMMIT ----------
    commitBtn.addEventListener("click", async () => {
        const currentState = window.missionManager.getState()

        if (!window.missionManager.isActive()) return

        const report   = window.missionManager.getReport() ?? {}
        const name     = (report.name ?? "").trim()
        const location = (report.location ?? "").trim()

        if (!name || !location)
            return window.notif.error("Nom et localisation requis")

        commitBtn.disabled  = true
        commitBtn.innerText = "Envoi..."

        try {
            const localResult = await window.api.finalizeMission({
                csvPath: currentState.csvPath,
                reportName: name,
                source: currentState.source
            })
            if (!localResult.success) throw new Error("Erreur sauvegarde locale")

            const finalPath = localResult.finalPath
            const csvResult = await window.api.readCSVFile(finalPath)
            if (!csvResult.success) throw new Error("Lecture CSV impossible")

            await window.missionManager.updateCSVPath(finalPath)

            const { loadCSVViewer } = await window.csvViewer.load()
            loadCSVViewer({
                containerId: "csv-viewer",
                getCSV: () => window.api.readCSVFile(finalPath)
            })

            await window.fetchAPI("", {
                method: "POST",
                body: {
                    name,
                    location,
                    radius: window.missionManager.getRadius(),
                    csv_content: csvResult.content
                },
                showNotif: true,
                successMsg: "Mission ajoutée avec succès"
            })

            await window.missionManager.cancelMission()
            missionNameInput.value     = ""
            missionLocationInput.value = ""
            window.page.change("home")

        } catch (err) {
            window.notif.error("Erreur", err.message, 4000)
        } finally {
            commitBtn.disabled  = false
            commitBtn.innerText = "Commit Report"
        }
    })

    // ---------- CANCEL ----------
    cancelBtnReport.addEventListener("click", async () => {
        if (!window.missionManager.isActive()) return
        await window.missionManager.cancelMission(true)
        missionNameInput.value     = ""
        missionLocationInput.value = ""
        window.notif.info("Rapport annulé", null, 3000)
        window.page.change("home")
    })
}