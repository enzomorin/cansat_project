const dotenv = require("dotenv")
const path = require("path")
const { app } = require("electron")

const envPath = app.isPackaged
    ? path.join(path.dirname(app.getPath("exe")), ".env")
    : path.join(process.cwd(), ".env")

dotenv.config({ path: envPath })

const CONFIG = {
    apiUrl:  process.env.API_URL,
    apiKey:  process.env.API_KEY,
    port:    parseInt(process.env.PORT, 10),
    appName: process.env.APP_NAME
}

for (const [key, value] of Object.entries(CONFIG)) {
    if (value === undefined || value === null)
        console.warn(`Config value for ${key} is not set in .env`)
}

function getConfig() { return { ...CONFIG } }

module.exports = { getConfig }