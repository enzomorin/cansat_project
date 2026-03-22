const fs = require("fs").promises
const path = require("path")
const { app } = require("electron")

const stateFile = path.join(app.getPath("userData"), "mission.json")

let cache = null

async function saveMissionState(state) {
    cache = state

    await fs.writeFile(
        stateFile,
        JSON.stringify(state)
    )
}

async function getMissionState() {
    if (cache)
        return cache
    try {
        const data = await fs.readFile(stateFile, "utf8")

        cache = JSON.parse(data)

        return cache
    } catch {
        return null
    }
}

async function clearMissionState() {
    cache = null

    await fs.unlink(stateFile).catch(() => {})
}

module.exports = {
    saveMissionState,
    getMissionState,
    clearMissionState
}