const reportText = document.getElementById('report-text')
const commitBtn = document.getElementById('commit-report-btn')
const cancelBtnReport = document.getElementById('cancel-report-btn')

const csvViewer = document.getElementById('csv-viewer')

reportText.value = window.missionManager.getReport() ?? ""

reportText.addEventListener('input', async () => {
    await window.missionManager.updateReport(reportText.value)
})

async function loadCSV(path) {
    const result = await window.api.readCSVFile(path)

    if (!result.success) {
        window.notif.error("Erreur lecture CSV", result.error, 3000)
        return
    }

    // Sécurité si fichier vide ou null
    const content = result.content ?? ""

    if (content.trim().length === 0) {
        csvViewer.innerHTML = `
            <div class="csv-empty-state">
                <i data-lucide="database"></i>
                <p>Aucune donnée disponible</p>
                <small>Le fichier CSV ne contient encore aucune ligne.</small>
            </div>
        `
        window.api.lucide.render()
        return
    }

    const lines = content.split('\n').filter(l => l.trim() !== '')
    
    if (lines.length === 0) {
        csvViewer.innerHTML = `
            <div class="csv-empty-state">
                <i data-lucide="file-x"></i>
                <p>Fichier vide</p>
            </div>
        `
        window.api.lucide.render()
        return
    }
    
    let html = "<table class='csv-table'>"

    for (const line of lines) {
        const cols = line.split(',')
        html += "<tr>"
        for (const col of cols) {
            html += `<td>${col}</td>`
        }
        html += "</tr>"
    }

    html += "</table>"

    csvViewer.innerHTML = html
}

const state = window.missionManager.getState()
if (state?.csvPath) {
    loadCSV(state.csvPath)
}

commitBtn.addEventListener('click', async () => {
    if (!window.missionManager.isActive()) return

    const state = window.missionManager.getState()
    const result = await window.api.finalizeMission({
        csvPath: state.csvPath,
        reportName: reportText.value,
        source: state.source
    })

    if (result.success) {
        await window.missionManager.cancelMission()
        window.notif.success("Mission finalisée", null, 3000)
        window.page.change('home')
    } else {
        window.notif.error("Erreur finalisation", result.error, 3000)
    }
})

cancelBtnReport.addEventListener('click', async () => {
    if (window.missionManager.isActive()) {
        await window.missionManager.cancelMission()
        reportText.value = ""
        window.notif.info("Rapport annulé", null, 3000)
        window.page.change('home')
    }
})
