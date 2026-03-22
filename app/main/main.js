const { app, BrowserWindow } = require("electron")
const { createMainWindow } = require("./window.js")
const serial = require("./serial.js")
const initIPC = require("./ipc.js")
const registerIPC = require("../src/ipc/index.js")

app.commandLine.appendSwitch("disable-renderer-backgrounding")

app.whenReady().then(() => {
    initIPC()
    registerIPC()
    createMainWindow()

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createMainWindow()
    })
})

// close serial port before quit
app.on("before-quit", async () => {
    await serial.close()
})

app.on("window-all-closed", async () => {
    await serial.close()
    if (process.platform !== "darwin") app.quit()
})