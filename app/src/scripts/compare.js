export default async function({ params }) {
    const missionId = params.missionId

    if (missionId){
        window.loadCSVViewer({
            containerId: "csv-viewer",
            getCSV: () => window.fetchAPI(`/csv?id=${missionId}`, "GET", false)
        })
    }

    const cancelBtnReport = document.getElementById('quit-btn')
    cancelBtnReport?.addEventListener('click', () => {
        window.page.change('home')
    })
}