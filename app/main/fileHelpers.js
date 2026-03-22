const fs = require("fs").promises
const path = require("path")
const { app } = require("electron")

const missionsDir = path.join(app.getPath("userData"), "missions")
async function ensureMissionsDir() { await fs.mkdir(missionsDir, { recursive: true }) }

const safeFileName = name => 
    (name ? name.toString().trim().replace(/[^a-z0-9_\-]/gi, "_").toLowerCase() : "mission")

async function generateUniquePath(baseName) {
    await ensureMissionsDir()
    let filePath = path.join(missionsDir, `${safeFileName(baseName)}.csv`)
    let counter = 1

    while (true) {
        try {
            await fs.access(filePath)
            filePath = path.join(missionsDir, `${safeFileName(baseName)}_${counter}.csv`)
            counter++
        } catch { break }
    }
    return filePath
}

async function createSerialFile() {
    const filePath = await generateUniquePath(`serial_${Date.now()}`)
    await fs.writeFile(filePath, "")
    return filePath
}

async function readCSVFile(filePath) {
    try { return { success: true, content: await fs.readFile(filePath, "utf8") } }
    catch (err) { return { success: false, error: err.message } }
}

async function copyFile(src, dest) { await fs.copyFile(src, dest) }
async function deleteFile(filePath) { await fs.unlink(filePath).catch(() => {}) }

async function finalizeMission(csvPath, reportName) {
    if (!csvPath) return { success: false, error: "Aucun CSV fourni" }
    try {
        const finalPath = await generateUniquePath(reportName || "mission")
        await fs.rename(csvPath, finalPath)
        return { success: true, finalPath }
    } catch (err) {
        return { success: false, error: err.message }
    }
}

module.exports = {
    missionsDir,
    ensureMissionsDir,
    safeFileName,
    generateUniquePath,
    createSerialFile,
    readCSVFile,
    copyFile,
    deleteFile,
    finalizeMission
}