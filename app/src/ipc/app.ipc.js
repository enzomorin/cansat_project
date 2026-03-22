const { ipcMain, app, shell } = require("electron")

module.exports = () => {
    ipcMain.handle("app:getVersion", () => app.getVersion())
    ipcMain.handle("open-external", (_, url) => shell.openExternal(url))
}