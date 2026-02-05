const { contextBridge, ipcRenderer, shell } = require('electron')
const { createIcons, icons } = require('lucide')

contextBridge.exposeInMainWorld('api', {
    version: () => ipcRenderer.invoke('appVersion'),
    electron: () => process.versions.electron,
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    openExternal: (url) => shell.openExternal(url),
    lucide: {render: () => createIcons({ icons })},
    openPortWindow: () => ipcRenderer.invoke('open-port-window'),
    listPorts: () => ipcRenderer.invoke('list-serial-ports'),
    connectPort: (path) => ipcRenderer.invoke('connect-port', path),
    onSerialConnected: (callback) => ipcRenderer.on('serial-connected', (_, data) => callback(data)),
    onSerialDisconnected: (callback) => ipcRenderer.on('serial-disconnected', () => callback()),
    onSerialData: (callback) => ipcRenderer.on('serial-data', (_, data) => callback(data)),
    onSerialError: (callback) => ipcRenderer.on('serial-error', (_, data) => callback(data)),
    onSerialWarning: (callback) => ipcRenderer.on('serial-warning', (_, data) => callback(data)),
})