const serialIPC = require("./serial.ipc.js")
const missionIPC = require("./mission.ipc.js")
const fileIPC = require("./file.ipc.js")
const appIPC = require("./app.ipc.js")

module.exports = function registerIPC() {
    serialIPC()
    missionIPC()
    fileIPC()
    appIPC()
}