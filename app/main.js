const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron/main')
const path = require('node:path')
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const fs = require('fs').promises

let mainWindow
let portWindow
let serialPort
let parser

const userDataPath = app.getPath("userData")
const missionStatePath = path.join(userDataPath, "mission_state.json")
const missionsDir = path.join(__dirname, 'log', 'missions')

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

async function ensureMissionsDir() {
    await fs.mkdir(missionsDir, { recursive: true })
}

function safeFileName(name) {
    return name.replace(/[^a-z0-9]/gi, "_").toLowerCase()
}

async function generateUniquePath(baseName) {
    let filePath = path.join(missionsDir, `${baseName}.csv`)
    let counter = 1

    while (true) {
        try {
            await fs.access(filePath)
            filePath = path.join(missionsDir, `${baseName}_${counter}.csv`)
            counter++
        } catch {
            break
        }
    }
    return filePath
}

function registerIpcHandler() {
    ipcMain.handle('appVersion', async () => { return app.getVersion() })

    ipcMain.handle('open-port-window', () => {
        if (portWindow && !portWindow.isDestroyed()) {
            portWindow.focus()
            return
        }

        mainWindow.setEnabled(false)

        portWindow = new BrowserWindow({
            width: 400,       // plus petit
            height: 250,
            parent: mainWindow,
            modal: true,      // empêche d’interagir avec mainWindow tant qu’elle est ouverte
            resizable: false,
            minimizable: false,
            maximizable: false,
            title: 'Choisir un port série',
            webPreferences: {
                preload: path.join(__dirname, 'src', 'preload.js'),
                contextIsolation: true,
                nodeIntegration: true
            }
        })

        portWindow.loadFile(path.join(__dirname, 'src/ports.html'))

        portWindow.on('closed', () => {
            portWindow = null
        })
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
            mainWindow?.webContents.send('serial-data', `${times},${line}`)

            try {
                const state = JSON.parse(await fs.readFile(missionStatePath))
                if (state?.csvPath) await fs.appendFile(state.csvPath, `${times},${line}\n`)
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

    ipcMain.handle('save-mission-state', async (_, state) => {
        await fs.writeFile(missionStatePath, JSON.stringify(state, null, 2))
    })

    ipcMain.handle('load-mission-state', async () => {
        try {
            return JSON.parse(await fs.readFile(missionStatePath, 'utf-8'))
        } catch {
            return null
        }
    })

    ipcMain.handle('clear-mission-state', async () => {
        await fs.unlink(missionStatePath).catch(() => {})
    })

    ipcMain.handle('finalize-mission', async (_, { csvPath, reportName }) => {
        try {
            if (!csvPath) {
                return { success: false, error: "Aucun fichier CSV" }
            }

            await ensureMissionsDir()

            const safeName = safeFileName(reportName || 'mission')
            const finalPath = await generateUniquePath(safeName)

            await fs.rename(csvPath, finalPath)

            return { success: true, finalPath }
        } catch (err) {
            return { success: false, error: err.message }
        }
    })

    ipcMain.handle('dialog-open-csv', async () => {
        const result = await dialog.showOpenDialog({
            title: 'Choisir un fichier CSV',
            properties: ['openFile'],
            filters: [{ name: 'CSV Files', extensions: ['csv'] }]
        })
        return result || { canceled: true, filePaths: [] }
    })

    ipcMain.handle('create-serial-file', async () => {
        await ensureMissionsDir()
        const baseName = `serial_${Date.now()}`
        const filePath = await generateUniquePath(baseName)
        await fs.writeFile(filePath, '')
        return filePath
    })

    ipcMain.handle('read-csv-file', async (_, filePath) => {
        try {
            const content = await fs.readFile(filePath, 'utf-8')
            return { success: true, content }
        } catch (err) {
            return { success: false, error: err.message }
        }
    })

    ipcMain.handle('generate-unique-mission-path', async (_, baseName) => {
        await ensureMissionsDir()
        return await generateUniquePath(safeFileName(baseName))
    })

    ipcMain.handle('copy-file', async (_, src, dest) => {
        await fs.copyFile(src, dest)
    })

    ipcMain.handle('delete-file', async (_, filePath) => {
        await fs.unlink(filePath).catch(() => {})
    })
}

// launching app
app.on('ready', () => {
    registerIpcHandler()
    createwindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createwindow()
        }
    })
})

// closing app
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})