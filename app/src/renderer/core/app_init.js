import { initSidebar } from "../module/sidebar.js"
import { lucideInitObserverTrigger } from "../module/lucide.js"
import { initSerialListeners } from "./serial_manager.js"

export function initUI() {
    const content = document.getElementById("content")

    if (content) {
        content.innerHTML = `
        <div class="center">
            <span class="loader"></span>
            <span>Chargement de l'application...</span>
        </div>
        `
    }

    initSidebar(window.page.change)

    lucideInitObserverTrigger()
}


export async function initApp() {
    const missionManager  = await import("../module/mission_manager.js")
    window.missionManager = missionManager

    await Promise.all([
        missionManager.init(),
        initSerialListeners()
    ])
}