const { ipcMain } = require("electron")
const { saveMissionState, getMissionState, clearMissionState } = require("../../main/missionStore.js")
const { ensureMissionsDir, generateUniquePath, safeFileName } = require("../../main/fileHelpers.js")
const fs = require("fs").promises

module.exports = () => {
    ipcMain.handle("save-mission-state", (_, state) => saveMissionState(state))
    ipcMain.handle("load-mission-state", () => getMissionState())
    ipcMain.handle("clear-mission-state", () => clearMissionState())

    ipcMain.handle("create-serial-file", async () => {
        await ensureMissionsDir()
        const baseName = `serial_${Date.now()}`
        const filePath = await generateUniquePath(baseName)
        await fs.writeFile(filePath, "")
        return filePath
    })

    ipcMain.handle("generate-unique-mission-path", (_, base) =>
        generateUniquePath(safeFileName(base))
    )

    ipcMain.handle("finalize-mission", async (_, { csvPath, reportName }) => {
        if (!csvPath) return { success: false, error: "Aucun fichier CSV" }
        await ensureMissionsDir()
        const safeName = safeFileName(reportName || "mission")
        const finalPath = await generateUniquePath(safeName)
        await fs.rename(csvPath, finalPath)
        return { success: true, finalPath }
    })
}