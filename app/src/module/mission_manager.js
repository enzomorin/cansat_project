let state = null
let closingSerial = false

const missionStateInit = {
    active: false,
    type: null,
    source: null,
    csvPath: null,
    portPath: null,
    reportData: {
        name: "",
        location: ""
    }
}

export async function init() {
    state = await window.api.loadMissionState() ?? { ...missionStateInit }
}

export async function startMission(type, source, csvPath = null, portPath = null) {
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
        csvPath,
        portPath,
        reportData: {
            name: "",
            location: ""
        }
    }

    await persist()

    if (type === 'serial') window.page.change('data_port')
    else window.page.change('report')
}

export async function endMission() {
    if (!state.active) return

    switch (state.type) {
        case "serial":
            await closeSerialPort()
            state.type = "report"
            await persist()
            window.page.change("report")
            break

        case "report":
            await clearMissionStateFile()
            resetState()
            await persist()
            window.page.change("home")
            break

        default:
            resetState()
            await persist()
            window.page.change("home")
            break
    }
}

// mission_manager.js
export async function closeSerialPort() {
    try {
        closingSerial = true
        await window.api.connectPort(null)
    } catch (err) {
        window.notif.info('Impossible de fermer le port série :', err, 300)
    }
}

function resetState() {
    state = {
        active: false,
        type: null,
        csvPath: null,
        startedAt: null
    }
}

export async function cancelMission(deleteFile = false) {
    if (state?.type === "serial") { await closeSerialPort() }
    if (deleteFile && state?.csvPath) {
        await window.api.deleteFile(state.csvPath).catch(() => {})
    }
    state = { ...missionStateInit }
    await window.api.clearMissionState()
}

export async function updateReport(content) {
    if (!state.active) return
    state.reportData = { ...state.reportData, ...content }
    await persist()
}

export async function updateCSVPath(path) {
    if (!state.active) return
    state.csvPath = path
    await persist()
}

export function getReport() { return state.reportData }
export function getCurrentMissionType() { return state?.type ?? null }
export function getState() { return state }
export function isActive() { return state.active }
export function isSerial() { return state.type === "serial" }
export function isCSV() { return state.type === "csv" }
export function isClosingSerial() { return closingSerial }
export function resetClosingSerial() { closingSerial = false }

export function restoreNavigation() {
    if (!state?.active) {
        window.page.change('home')
        return
    }

    switch (state.type) {
        case 'serial':
            window.page.change('data_port', { restored: true })
            if (state.portPath) {
                setTimeout(async () => {
                    try {
                        const selected = state.portPath.value?.trim()
                        const res = await window.api.connectPort(selected)
                        if (res.connected) {
                            window.notif.info('Port reconnecté automatiquement', null, 3000)
                        } else {
                            window.notif.error('Impossible de reconnecter le port', res.error, 3000)
                        }
                    } catch (err) {
                        window.notif.error('Erreur reconnection série', err.message, 3000)
                    }
                }, 500)
            } else window.notif.info('Aucun port enregistré pour reconnexion', null, 3000)
            break

        case 'csv':
        case 'report':
            window.page.change('report', { restored: true })
            break

        default:
            window.page.change('antenna')
            break
    }
}

async function persist() {
    await window.api.saveMissionState(state)
}

async function clearMissionStateFile() {
    state = { ...missionStateInit }
    await window.api.clearMissionState()
}