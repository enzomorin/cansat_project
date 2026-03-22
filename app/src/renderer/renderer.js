import { initUI, initApp } from "./core/app_init.js"
import { restoreMissionState } from "./core/restore_state.js"
import { changePage } from "./module/pages.js"
import { fetchAPI } from "./module/request.js"

import "./core/heavy_loader.js"

import * as geoco from "./module/geo_coo.js"
import * as notif from "./module/notif.js"
import * as actionMenu from "./module/action_menu.js"

// API init
window.page ||= {}

window.page.change = changePage
window.geoco = geoco
window.fetchAPI = fetchAPI
window.notif = notif
window.actionMenu = actionMenu

// BOOT APP
async function boot() {
    try {
        initUI()

        await initApp()

        await new Promise(requestAnimationFrame)

        // Optional: replace loader with actual home page content
        await window.page.change("home")

        // restore state
        restoreMissionState()
    } catch (err) {
        console.error("Renderer boot error:", err)
        window.notif.error("Erreur démarrage", err.message, 4000)
    }
}

boot()