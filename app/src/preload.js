const { contextBridge, ipcRenderer, shell } = require('electron/main')
const { createIcons, icons } = require('lucide')

contextBridge.exposeInMainWorld('api', {
    version: () => ipcRenderer.invoke('appVersion'),
    electron: () => process.versions.electron,
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,

    openExternal: (url) => shell.openExternal(url),
    lucide: { render: () => createIcons({ icons })},

    openPortWindow: () => ipcRenderer.invoke('open-port-window'),
    listPorts: () => ipcRenderer.invoke('list-serial-ports'),
    connectPort: (path) => ipcRenderer.invoke('connect-port', path),

    onSerialConnected: (callback) => ipcRenderer.on('serial-connected', (_, data) => callback(data)),
    onSerialDisconnected: (callback) => ipcRenderer.on('serial-disconnected', () => callback()),
    onSerialData: (callback) => ipcRenderer.on('serial-data', (_, data) => callback(data)),
    onSerialError: (callback) => ipcRenderer.on('serial-error', (_, data) => callback(data)),
    onSerialWarning: (callback) => ipcRenderer.on('serial-warning', (_, data) => callback(data)),

    saveMissionState: (state) => ipcRenderer.invoke('save-mission-state', state),
    loadMissionState: () => ipcRenderer.invoke('load-mission-state'),
    clearMissionState: () => ipcRenderer.invoke('clear-mission-state'),
    finalizeMission: (data) => ipcRenderer.invoke('finalize-mission', data),

    openCSVFile: async () => {
        const result = await ipcRenderer.invoke('dialog-open-csv')
        if (!result || result.canceled || !result.filePaths?.length) return null
        return result.filePaths[0]
    },
    createSerialFile: () => ipcRenderer.invoke('create-serial-file'),
    readCSVFile: (path) => ipcRenderer.invoke('read-csv-file', path),
    generateUniqueMissionPath: (baseName) => ipcRenderer.invoke('generate-unique-mission-path', baseName),
    copyFile: (src, dest) => ipcRenderer.invoke('copy-file', src, dest),
    deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
})