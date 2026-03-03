document.getElementById('new-mission-button')?.addEventListener("click", () => {
    const state = window.missionManager.getState()
    if (!state?.active) {
        window.page.change('antenna')
        return
    }

    window.missionManager.restoreNavigation()
})

document.getElementById("github-redirect")?.addEventListener("click", () => {
    window.api.openExternal("https://github.com/0kibob/sti2d.ldv-cansat")
})

window.notif.success('Home Page Loaded', 'The home page has been loaded successfully.')