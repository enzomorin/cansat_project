const missionNameInput = document.getElementById("mission-name")
const missionLocationInput = document.getElementById("mission-location")
const commitBtn = document.getElementById('commit-report-btn')
const cancelBtnReport = document.getElementById('cancel-report-btn')

const csvViewer = document.getElementById('csv-viewer')
const state = window.missionManager.getState()

if (state?.csvPath && window.loadCSVViewer) {
    if (state?.csvPath) {
        window.loadCSVViewer({
            containerId: "csv-viewer",
            getCSV: () => window.api.readCSVFile(state.csvPath)
        })
    }
}

const data = window.missionManager.getReport() ?? { name:"", location:"" }
missionNameInput.value = data.name ?? ""
missionLocationInput.value = data.location ?? ""

missionNameInput.addEventListener("input", async () => {
    await window.missionManager.updateReport({
        name: missionNameInput.value
    })
})

missionLocationInput.addEventListener("input", async () => {
    await window.missionManager.updateReport({
        location: missionLocationInput.value
    })
})
missionLocationInput.addEventListener("change", () => {
    const value = missionLocationInput.value.trim()
    const parts = value.split(",")

    if (parts.length !== 2) return

    const lat = parseFloat(parts[0])
    const lon = parseFloat(parts[1])
    if (isNaN(lat) || isNaN(lon)) return

    const tool = window.trackerMap.getTool()
    if (tool === "circle") {
        window.trackerMap.drawCircle(lat, lon)
    } else {
        window.trackerMap.setMarker(lat, lon)
    }
})

commitBtn.addEventListener('click', async () => {
    if (!window.missionManager.isActive()) return

    const data = window.missionManager.getReport() ?? {}
    const name = (data.name ?? "").trim()
    const location = (data.location ?? "").trim()
    if (!name || !location) {
        window.notif.error("Nom et localisation requis")
        return
    }

    commitBtn.disabled = true
    commitBtn.innerText = "Envoi..."

    try {
        const state = window.missionManager.getState()

        const localResult = await window.api.finalizeMission({
            csvPath: state.csvPath,
            reportName: name,
            source: state.source
        })
        if (!localResult.success) throw new Error("Erreur sauvegarde locale")

        const finalPath = localResult.finalPath
        const csvResult = await window.api.readCSVFile(finalPath)
        if (!csvResult.success) throw new Error("Lecture CSV impossible")
        await window.missionManager.updateCSVPath(finalPath)
        await window.loadCSVViewer({
            containerId: "csv-viewer",
            getCSV: () => window.api.readCSVFile(finalPath)
        })

        const payload = {
            name: name,
            location: location,
            csv_content: csvResult.content
        }

        const result = await fetchAPI("", "POST", false, payload, "Mission add with success !", "Error while adding report...")
        if (!result.success) throw new Error("Erreur API")

        await window.missionManager.cancelMission()

        missionNameInput.value = ""
        missionLocationInput.value = ""

        window.notif.success("Mission sauvegardée (local + serveur)", null, 3000)
        window.page.change('home')
    } catch (err) {
        window.notif.error("Erreur", err.message, 4000)
    } finally {
        commitBtn.disabled = false
        commitBtn.innerText = "Commit Report"
    }
})

cancelBtnReport.addEventListener('click', async () => {
    if (window.missionManager.isActive()) {
        await window.missionManager.cancelMission(true)
        missionNameInput.value = ""
        missionLocationInput.value = ""
        window.notif.info("Rapport annulé", null, 3000)
        window.page.change('home')
    }
})

window.trackerMap.initMap("map-container")
window.addEventListener("map:location-selected", async (event) => {
    const { lat, lon } = event.detail
    const value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`
    missionLocationInput.value = value
    await window.missionManager.updateReport({ location: value })
})
if (data.location) {
    const [lat, lon] = data.location.split(",").map(Number)

    const tool = window.trackerMap.getTool()
    if (tool === "circle") window.trackerMap.drawCircle(lat, lon)
    else window.trackerMap.setMarker(lat, lon)
}
