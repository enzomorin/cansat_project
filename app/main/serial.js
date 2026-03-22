const { SerialPort } = require("serialport")
const { ReadlineParser } = require("@serialport/parser-readline")
const fs = require("fs").promises

const { getMainWindow } = require("./window.js")
const { getMissionState } = require("./missionStore.js")

let port = null
let parser = null
let writeBuffer = []
let csvPath = null

async function listPorts() {
    return await SerialPort.list()
}

async function connect(portPath, missionCsvPath) {
    csvPath = missionCsvPath

    if (!portPath)
        throw new Error("Invalid port")

    if (port && port.isOpen)
        await close()

    port = new SerialPort({
        path: portPath,
        baudRate: 115200,
        autoOpen: false
    })

    await new Promise((resolve, reject) => {
        port.open(err => err ? reject(err) : resolve())
    })

    parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }))

    getMainWindow()?.webContents.send("serial-connected", portPath)

    parser.on("data", data => {
        const line = data.toString().trim()

        const time = new Date().toLocaleTimeString()

        const formatted = `${time},${line}`

        getMainWindow()?.webContents.send("serial-data", formatted)

        writeBuffer.push(formatted)

        if (writeBuffer.length >= 200)
            flushBuffer()
    })

    port.on("close", () => {
        getMainWindow()?.webContents.send("serial-disconnected")

        port = null
        parser = null
    })

    port.on("error", err => {
        getMainWindow()?.webContents.send("serial-error", err.message)
    })
}

async function flushBuffer() {
    if (!writeBuffer.length || !csvPath) { writeBuffer = []; return }

    const data = writeBuffer.join("\n") + "\n"

    writeBuffer = []
    
    await fs.appendFile(csvPath, data)
}

async function close() {
    if (!port || !port.isOpen)
        return

    await new Promise(resolve => port.close(resolve))

    await flushBuffer()

    port = null
    parser = null
}

module.exports = {
    listPorts,
    connect,
    close
}