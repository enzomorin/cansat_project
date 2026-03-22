const { ipcMain } = require("electron")
const serial = require("../../main/serial.js")
const { openPortWindow } = require("../../main/window.js")
const { getMissionState } = require("../../main/missionStore.js")

module.exports = () => {
    ipcMain.handle("open-port-window", () => openPortWindow())
    ipcMain.handle("list-serial-ports", () => serial.listPorts())

    ipcMain.handle("connect-port", async (_, portPath) => {
        if (!portPath?.trim()) {
            await serial.close()
            return { connected: false }
        }
        try {
            const state = await getMissionState()
            await serial.connect(portPath, state?.csvPath ?? null)
            return { connected: true }
        } catch (err) {
            return { connected: false, error: err.message }
        }
    })
}