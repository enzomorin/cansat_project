let state = null

const missionStateInit = {
    active: false,
    type: null,
    source: null,
    reportCompleted: false,
    csvPath: null,
    reportData: ""
}

export async function init() {
    state = await window.api.loadMissionState() ?? { ...missionStateInit }
}

export async function startMission(type, source, csvPath = null) {
    if (state.active) return

    if (type === 'csv' && source === 'import' && csvPath) {
        const baseName = csvPath.split(/[\\/]/).pop().replace(/\.csv$/i, '')
        const finalPath = await window.api.generateUniqueMissionPath(baseName)
        await window.api.copyFile(csvPath, finalPath)
        csvPath = finalPath
    }

    state = {
        active: true,
        type,
        source,
        reportCompleted: false,
        csvPath,
        reportData: "",
    }

    await persist()

    if (type === 'serial') window.page.change('data_port')
    else window.page.change('report')
}

export async function endMission() {
    if (!state.active) return

    if (state.type === 'serial') {
        state.type = 'report'
        state.active = true
        await persist()
        window.page.change('report')
    } else if (state.type === 'report') {
        await clearMissionStateFile()
    } else {
        state.active = false
        await persist()
    }
}

export async function cancelMission() {
    if (state?.csvPath) {
        await window.api.deleteFile(state.csvPath).catch(() => {})
    }
    state = { ...missionStateInit }
    await window.api.clearMissionState()
}

export async function updateReport(content) {
    if (!state.active) return
    state.reportData = content
    await persist()
}

export async function completeReport() {
    if (!state.active) return
    state.reportCompleted = true
    await persist()
}

export function getReport() { return state.reportData }
export function getState() { return state }
export function isActive() { return state.active }
export function isSerial() { return state.type === "serial" }
export function isCSV() { return state.type === "csv" }

export function restoreNavigation() {
    if (!state?.active || state.reportCompleted) {
        window.page.change('home')
        return
    }

    if (state.type === 'serial') {
        window.page.change('data_port', { restored: true })
        return
    }

    if (state.type === 'csv' || state.type === 'report') {
        window.page.change('report', { restored: true })
        return
    }

    window.page.change('antenna') 
}

async function persist() {
    await window.api.saveMissionState(state)
}

async function clearMissionStateFile() {
    state = { ...missionStateInit }
    await window.api.clearMissionState()
}