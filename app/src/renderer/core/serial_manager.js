export function initSerialListeners() {
    window.api.onSerialConnected(handleConnected)

    window.api.onSerialDisconnected(handleDisconnected)

    window.api.onSerialError(
        msg => window.notif.error("Erreur série", msg, 3000))

    window.api.onSerialWarning(
        msg => window.notif.info("Port série", msg, 2000))
}

async function handleConnected(portPath) {
    try {
        const missionManager = window.missionManager
        
        if (!missionManager.isActive()) {
            const csvPath = await window.api.createSerialFile()

            await missionManager.startMission(
                "serial",
                "antenna",
                csvPath,
                portPath
            )
        }

        window.notif.success("Port série connecté", null, 3000)

        window.page.change("data_port")
    } catch (err) {
        console.error(err)
        window.notif.error("Erreur connexion série", err.message, 3000)
    }
}

async function handleDisconnected() {
    try {
        const missionManager = window.missionManager

        if (missionManager.isClosingSerial()) {
            missionManager.resetClosingSerial()
            return
        }

        if (missionManager.isActive()) {
            await missionManager.cancelMission()
        }

        window.page.change("home")

        window.notif.error("Port série déconnecté", null, 3000)
    } catch (err) {
        console.error(err)
    }
}