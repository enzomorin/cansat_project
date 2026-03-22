const { ipcMain } = require("electron")
const { getConfig } = require("./config.js")

const CONFIG = getConfig()

function initIPC() {
    ipcMain.handle("api:request", async (_, { endpoint, method = "GET", body = null }) => {
        try {
            const resp = await fetch(CONFIG.apiUrl + endpoint, {
                method,
                headers: {
                    "x-api-key": CONFIG.apiKey,
                    "Content-Type": "application/json"
                },
                body: body ? JSON.stringify(body) : undefined
            })
            if (!resp.ok) throw new Error(resp.status)

            const data = await resp.json()
            return { success: true, data }
        } catch (err) {
            const isConnectionError = err.cause?.code === "ECONNREFUSED"
                || err.cause instanceof AggregateError

            if (!isConnectionError)
                console.error("API request error:", err)

            return { 
                success: false, 
                error: isConnectionError 
                    ? "Serveur inaccessible" 
                    : err.message 
            }
        }
    })

    ipcMain.handle("app:getConfig", () => {
        const { apiKey, ...safe } = getConfig()
        return safe
    })
}

module.exports = initIPC