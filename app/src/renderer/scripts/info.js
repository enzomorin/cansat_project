export default async function({ params }) {
    const versionLabel = document.getElementById('version')
    const infoLabel = document.getElementById('info')
    const githubBtn = document.getElementById('github-button')
    const siteBtn = document.getElementById('site-button')

    if (versionLabel) {
        const version = await window.api.version()
        versionLabel.innerText = `app on v.${version}`
    }

    if (infoLabel) {
        infoLabel.innerText = `
                            this app using Chrome: (v${window.api.chrome()}),
                            Node.js: (v${window.api.node()}),
                            and Electron: (v${window.api.electron()})
        `
    }

    githubBtn?.addEventListener('click', () => {
        window.api.openExternal("https://github.com/enzomorin/cansat_project")
    })

    siteBtn?.addEventListener('click', () => {
        window.api.openExternal("https://www.youtube.com/watch?v=IAYhEkVtNuQ&list=RDIAYhEkVtNuQ&start_radio=1")
    })

    window.lucideInitObserverTrigger?.()
}