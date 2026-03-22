let state = null
let closingSerial = false

const INITIAL_STATE = {
    active: false,
    type: null,
    source: null,
    csvPath: null,
    portPath: null,
    reportData: { name: "", location: "", radius: 500 }
}

export async function init() {
    state = await window.api.loadMissionState() ?? { ...INITIAL_STATE }
}

export async function startMission(type, source, csvPath = null, portPath = null) {
    if (state.active) return

    if (type === "csv" && source === "import" && csvPath) {
        const baseName = csvPath.split(/[\\/]/).pop().replace(/\.csv$/i, "")
        const finalPath = await window.api.generateUniqueMissionPath(baseName)
        await window.api.copyFile(csvPath, finalPath)
        csvPath = finalPath
    }

    state = {
        active: true,
        type,
        source,
        csvPath,
        portPath: typeof portPath === "string" ? portPath : null,
        reportData: { name: "", location: "", radius: 500 }
    }

    await persist()
    window.page.change(type === "serial" ? "data_port" : "report")
}

export async function endMission() {
    if (!state.active) return

    if (state.type === "serial") {
        await closeSerialPort()
        state.type = "report"
        await persist()
        window.page.change("report")
    } else {
        await clearState()
    }
}

export async function cancelMission(deleteFile = false) {
    if (state?.type === "serial") await closeSerialPort()
    if (deleteFile && state?.csvPath) await window.api.deleteFile(state.csvPath).catch(() => {})
    await clearState()
}

export async function updateReport(data) {
    if (!state.active) return
    state.reportData = { ...state.reportData, ...data }
    await persist()
}

export async function updateCSVPath(path) {
    if (!state.active) return
    state.csvPath = path
    await persist()
}

export function restoreNavigation() {
    if (!state.active) return window.page.change("home")

    switch (state.type) {
        case "serial":
            window.page.change("data_port", { restored: true })
            // Reconnect port after page is mounted
            if (state.portPath) setTimeout(async () => {
                const res = await window.api.connectPort(state.portPath)
                res.connected
                    ? window.notif.info("Port reconnecté automatiquement", null, 3000)
                    : window.notif.error("Impossible de reconnecter le port", res.error, 3000)
            }, 500)
            break
        case "csv":
        case "report":
            window.page.change("report", { restored: true })
            break
        default:
            window.page.change("antenna")
    }
}

export const getState   = ()       => state
export const getReport  = ()       => state?.reportData ?? null
export const getRadius  = ()       => state?.reportData?.radius ?? 500
export const isActive   = ()       => state?.active ?? false
export const isSerial   = ()       => state?.type === "serial"
export const isCSV      = ()       => state?.type === "csv"
export const getCurrentMissionType = () => state?.type ?? null
export const isClosingSerial       = () => closingSerial
export const resetClosingSerial    = () => { closingSerial = false }

async function persist()     { await window.api.saveMissionState(state) }
async function clearState()  { state = { ...INITIAL_STATE }; await window.api.clearMissionState() }

export async function closeSerialPort() {
    closingSerial = true
    await window.api.connectPort(null).catch(() =>
        window.notif.info("Impossible de fermer le port série")
    )
}