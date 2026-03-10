import { lucideInitObserverTrigger } from './module/lucide.js'
import { initSidebar } from './module/sidebar.js'
import { changePage } from './module/pages.js'
import { fetchAPI } from './module/request.js'
import { loadCSVViewer } from './module/csv_viewer.js'

import * as geoco from "./module/geo_coo.js"
import * as trackerMap from "./module/map.js"
import * as missionManager from './module/mission_manager.js'
import * as notif from './module/notif.js'
import * as actionMenu from './module/action_menu.js'

window.page ??= {}
window.page.change = changePage
window.trackerMap = trackerMap
window.geoco = geoco
window.fetchAPI = fetchAPI
window.notif = notif
window.actionMenu = actionMenu
window.missionManager = missionManager
window.loadCSVViewer = loadCSVViewer

// Initialise missionManager et sidebar
await missionManager.init()
lucideInitObserverTrigger()
initSidebar(window.page.change)

// Gestion port série
window.api.onSerialConnected(async (portPath) => {
    if (!missionManager.isActive()) {
        const csvPath = await window.api.createSerialFile()
        await missionManager.startMission('serial', 'antenna', csvPath, portPath)
    }
    notif.success('Port série connecté', null, 3000)
    window.page.change('data_port')
})

window.api.onSerialDisconnected(async () => {
    if (missionManager.isClosingSerial()) {
        missionManager.resetClosingSerial()
        return
    }
    if (missionManager.isActive()) { await missionManager.cancelMission() }
    window.page.change('home')
    notif.error('Port série déconnecté', null, 3000)
})

// Autres notifications
window.api.onSerialError(msg => notif.error('Erreur série', msg, 3000))
window.api.onSerialWarning(msg => notif.info('Port série', msg, 2000))

// Page par défaut ou page de mission si crash
const state = window.missionManager.getState()
if (state.active) {
    window.missionManager.restoreNavigation()
    window.notif.info('Mission restaurée', null, 3000)
} else {
    window.page.change('home')
}
