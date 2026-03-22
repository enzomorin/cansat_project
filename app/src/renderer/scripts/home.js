export default async function({ params }) {
    const newMissionBtn = document.getElementById('new-mission-button')
    const githubBtn = document.getElementById('github-button')

    newMissionBtn?.addEventListener('click', () => {
        const state = window.missionManager.getState()
        if (!state?.active) {
            window.page.change('antenna')
            return
        }
        window.missionManager.restoreNavigation()
    })

    githubBtn?.addEventListener('click', () => {
        window.api.openExternal("https://github.com/enzomorin/cansat_project")
    })

    window.notif.success('Home Page Loaded', 'The home page has been loaded successfully.')
}