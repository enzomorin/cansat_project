const { ipcMain, dialog, app } = require("electron")
const fs       = require("fs").promises
const fsSync   = require("fs")
const readline = require("readline")
const path     = require("path")

module.exports = () => {
    ipcMain.handle("read-csv-file", async (_, filePath) => {
        try {
            const stream = fsSync.createReadStream(filePath)
            const rl     = readline.createInterface({ input: stream, crlfDelay: Infinity })
            const lines  = []
            for await (const line of rl) {
                lines.push(line)
                if (lines.length >= 5000) break
            }
            return { success: true, content: lines.join("\n") }
        } catch (err) {
            return { success: false, error: err.message }
        }
    })

    ipcMain.handle("copy-file",   (_, src, dest) => fs.copyFile(src, dest))
    ipcMain.handle("delete-file", (_, filePath)  => fs.unlink(filePath).catch(() => {}))

    ipcMain.handle("list-mission-files", async () => {
        try {
            const { missionsDir } = require("../../main/fileHelpers.js")
            return (await fs.readdir(missionsDir)).filter(f => f.endsWith(".csv"))
        } catch { return [] }
    })

    ipcMain.handle("open-csv-file", async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [{ name: "CSV", extensions: ["csv"] }]
        })
        return canceled ? null : filePaths[0]
    })

    ipcMain.handle("save-csv-file", async (_, { content, suggestedName }) => {
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: "Enregistrer le CSV",
            defaultPath: path.join(
                app.getPath("downloads"),
                `${suggestedName || "mission"}.csv`
            ),
            filters: [{ name: "CSV", extensions: ["csv"] }]
        })

        if (canceled || !filePath) return { success: false }

        try {
            await fs.writeFile(filePath, content, "utf-8")
            return { success: true, filePath }
        } catch (err) {
            return { success: false, error: err.message }
        }
    })
}