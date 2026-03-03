import { lucideInitObserverTrigger } from './module/lucide.js'
import { initSidebar } from './module/sidebar.js'
import { changePage } from './module/pages.js'
import { fetchAPI } from './module/request.js'

import * as missionManager from './module/mission_manager.js'
import * as notif from './module/notif.js'
import * as actionMenu from './module/action_menu.js'

window.page ??= {}
window.page.change = changePage
window.fetchAPI = fetchAPI
window.notif = notif
window.actionMenu = actionMenu
window.missionManager = missionManager

// Initialise missionManager et sidebar
await missionManager.init()
lucideInitObserverTrigger()
initSidebar(window.page.change)

// Gestion click antenne dans la sidebar
const antennaBtn = document.querySelector('[data-pagelink="antenna"]')
antennaBtn?.addEventListener('click', () => {
    const state = window.missionManager.getState()
    if (!state?.active) {
        window.page.change('antenna')
        return
    }

    window.missionManager.restoreNavigation()
})

// Gestion port série
window.api.onSerialConnected(async () => {
    if (!missionManager.isActive()) {
        const csvPath = await window.api.createSerialFile()
        await missionManager.startMission('serial', 'antenna', csvPath)
    }
    notif.success('Port série connecté', null, 3000)
    window.page.change('data_port')
})

window.api.onSerialDisconnected(async () => {
    if (missionManager.isActive()) {
        await missionManager.endMission()
    }
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
