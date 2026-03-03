export default async function({ params }) {
    const missionId = params.missionId
    const csvViewer = document.getElementById('csv-viewer')

    async function loadCSVFromDB(missionId) {
        if (!missionId) {
            csvViewer.innerHTML = "<p style='color:red'>Aucun ID de mission fourni</p>"
            return
        }

        try {
            const result = await window.fetchAPI(
                `/csv?id=${missionId}`,
                "GET",
                false
            )

            if (!result.success) {
                csvViewer.innerHTML = `<p style='color:red'>Erreur : ${result.error}</p>`
                return
            }

            const content = result.data ?? ""
            if (!content.trim()) {
                csvViewer.innerHTML = "<p>Aucune donnée disponible</p>"
                return
            }

            const lines = content.split('\n').filter(l => l.trim() !== '')
            let html = "<table class='csv-table'>"
            for (const line of lines) {
                html += "<tr>" + line.split(',').map(col => `<td>${col}</td>`).join('') + "</tr>"
            }
            html += "</table>"

            csvViewer.innerHTML = html

        } catch (err) {
            csvViewer.innerHTML = `<p style='color:red'>Erreur : ${err}</p>`
        }
    }

    if (missionId) loadCSVFromDB(missionId)

    const cancelBtnReport = document.getElementById('quit-btn')
    cancelBtnReport?.addEventListener('click', () => {
        window.page.change('home')
    })
}