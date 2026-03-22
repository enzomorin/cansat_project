let mapPromise = null
let csvPromise = null
let chartPromise = null

export function loadMap() {
    if (!mapPromise) mapPromise = import("../module/map.js")
    return mapPromise
}

export function loadCSVViewer() {
    if (!csvPromise) csvPromise = import("../module/csv_viewer.js")
    return csvPromise
}

export function loadChartViewer() {
    if (!chartPromise) chartPromise = loadChartUMD()
        .then(() => import("../module/chart_viewer.js"))
    return chartPromise
}

function loadChartUMD() {
    return new Promise((resolve, reject) => {
        if (window.Chart) return resolve()

        const script = document.createElement("script")
        script.src   = "../../node_modules/chart.js/dist/chart.umd.js"
        script.onload  = resolve
        script.onerror = () => reject(new Error("Failed to load Chart.js UMD"))
        document.head.appendChild(script)
    })
}

window.csvViewer = { load: loadCSVViewer }

window.chartViewer = { load: loadChartViewer }

window.trackerMap = {
    load: loadMap,
    
    initMap:            async (...args) => (await loadMap()).initMap(...args),
    setMissionLocation: async (...args) => (await loadMap()).setMissionLocation(...args),
    setRadius:          async (...args) => (await loadMap()).setRadius(...args),
    getMission:         async (...args) => (await loadMap()).getMission(...args),
    refreshMap:         async (...args) => (await loadMap()).refreshMap(...args),
}