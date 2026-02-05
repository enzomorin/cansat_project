const { app, BrowserWindow, ipcMain, Menu } = require('electron/main')
const path = require('node:path')
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const fs = require('fs').promises

let mainWindow
let portWindow
let serialPort
let parser

const windowSettings =
{
    width: 800,
    height: 600,
    webPreferences: 
    {
        preload: path.join(__dirname, 'src', 'preload.js'),
        contextIsolation: true,
        nodeIntegration: true
    }
}

const createwindow = () => 
{
    mainWindow = new BrowserWindow(windowSettings)
    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'))

    Menu.setApplicationMenu(null)

    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F12') 
        {
            mainWindow.webContents.toggleDevTools()
            event.preventDefault()
        }
    })

    return mainWindow
}

function registerIpcHandler() {
    ipcMain.handle('appVersion', async () => { return app.getVersion() })

    ipcMain.handle('open-port-window', () => {
        portWindow = new BrowserWindow({
            width: 400,       // plus petit
            height: 250,
            parent: mainWindow,
            resizable: false,
            minimizable: false,
            maximizable: false,
            title: 'Choisir un port série',
            modal: true,      // empêche d’interagir avec mainWindow tant qu’elle est ouverte
            webPreferences: {
                preload: path.join(__dirname, 'src', 'preload.js'),
                contextIsolation: true,
                nodeIntegration: true
            }
        })

        portWindow.loadFile(path.join(__dirname, 'src/ports.html'))
    })

    ipcMain.handle('list-serial-ports', async () => {
        return await SerialPort.list()
    })

    ipcMain.handle('connect-port', async (event, portPath) => {
        if (serialPort?.isOpen) {
            await new Promise(port => serialPort.close(port))
        }

        // Remove all listeners
        serialPort?.removeAllListeners()
            parser?.removeAllListeners()

        serialPort = new SerialPort({
            path: portPath,
            baudRate: 115200,
            autoOpen: false
        })

        parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }))

        parser.on('data', async (data) => {
            const line = data.toString().trim()
            const times = new Date().toLocaleTimeString()
            mainWindow?.webContents.send('serial-data', `[${times}] ${line}`)

            try {
                const logPath = path.join(__dirname, 'log', 'serial_log.txt')
                await fs.appendFile(logPath, `[${times}] ${line}\n`)
            } catch (err) {
                mainWindow?.webContents.send('serial-error', `Erreur écriture fichier: ${err.message}`)
            }
        })

        serialPort.on('error', err => {
            console.error('Erreur série:', err.message)
            mainWindow?.webContents.send('serial-error', err.message)
        })

        serialPort.on('close', () => {
            mainWindow?.webContents.send('serial-disconnected')
        })

        await new Promise((resolve, reject) => {
            serialPort.open(err => err ? reject(err) : resolve())
        })

        mainWindow?.webContents.send('serial-connected', { port: portPath })
        return { connected: true }
    })
}

// launching app
app.on('ready', () => {
    registerIpcHandler()
    createwindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) 
        {
            createwindow()
        }
    })
})

// closing app
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})