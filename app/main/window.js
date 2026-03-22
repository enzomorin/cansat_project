const { BrowserWindow, Menu } = require("electron")
const path = require("path")

let mainWindow
let portWindow

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "../src/preload/preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            backgroundThrottling: false
        }
    })

    mainWindow.once("ready-to-show", () => mainWindow.show())

    mainWindow.loadFile(path.join(__dirname, "../src/html/index.html"))
    
    Menu.setApplicationMenu(null)

    mainWindow.webContents.on("before-input-event", (event, input) => {
        if (input.key === "F12") {
            mainWindow.webContents.toggleDevTools()
            event.preventDefault()
        }
    })
}

function openPortWindow() {
    if (portWindow && !portWindow.isDestroyed()) {
        portWindow.focus()
        return
    }

    portWindow = new BrowserWindow({
        width: 400,
        height: 250,
        parent: mainWindow,
        modal: true,
        resizable: false,
        minimizable: false,
        maximizable: false,
        webPreferences: {
            preload: path.join(__dirname, "../src/preload/preload.js"),
            contextIsolation: true,
            backgroundThrottling: false,
            sandbox: true,
            backgroundThrottling: false
        }
    })

    portWindow.loadFile(path.join(__dirname, "../src/html/ports.html"))

    portWindow.on("closed", () => {
        portWindow = null
    })
}

function getMainWindow() {
    return mainWindow
}

module.exports = {
    createMainWindow,
    openPortWindow,
    getMainWindow
}