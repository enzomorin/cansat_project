const { contextBridge, ipcRenderer } = require("electron")
const processVersions = process.versions

const wrapIPC = (channel) => (...args) => ipcRenderer.invoke(channel, ...args)
const wrapIPCEvent = (channel, transform = (data) => data) => (callback) =>
                                                                        ipcRenderer.on(channel, (_, data) => callback(transform(data)))

contextBridge.exposeInMainWorld("api", {
    // --- Serial connection ---
    openPortWindow: wrapIPC("open-port-window"),
    listPorts: wrapIPC("list-serial-ports"),
    connectPort: wrapIPC("connect-port"),

    // --- Serial events ---
    onSerialData: wrapIPCEvent("serial-data"),
    onSerialConnected: wrapIPCEvent("serial-connected"),
    onSerialDisconnected: wrapIPCEvent("serial-disconnected"),
    onSerialError: wrapIPCEvent("serial-error"),
    onSerialWarning: wrapIPCEvent("serial-warning"),

    // --- Mission state ---
    loadMissionState: wrapIPC("load-mission-state"),
    saveMissionState: wrapIPC("save-mission-state"),
    clearMissionState: wrapIPC("clear-mission-state"),
    createSerialFile: wrapIPC("create-serial-file"),
    finalizeMission: wrapIPC("finalize-mission"),

    // --- CSV / File operations ---
    readCSVFile: wrapIPC("read-csv-file"),
    listMissionFiles: wrapIPC("list-mission-files"),
    generateUniqueMissionPath: wrapIPC("generate-unique-mission-path"),
    copyFile: wrapIPC("copy-file"),
    deleteFile: wrapIPC("delete-file"),
    saveCSVFile: wrapIPC("save-csv-file"),

    // --- File picker ---
    openCSVFile: wrapIPC("open-csv-file"),

    // --- Env / App info ---
    config: wrapIPC("app:getConfig"),
    version: wrapIPC("app:getVersion"),
    chrome: () => processVersions.chrome,
    node: () => processVersions.node,
    electron: () => processVersions.electron,

    // --- External actions ---
    openExternal: (url) => ipcRenderer.invoke("open-external", url),

    // --- HTTP request ---
    request: wrapIPC("api:request")
})