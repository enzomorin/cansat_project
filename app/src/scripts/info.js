// App version
const versionLabel = document.getElementById('version')
const version = await api.version()
versionLabel.innerText = 'app on v.' + version

const information = document.getElementById('info')

information.innerText = `
                        this app using Chrome: (v${api.chrome()}), 
                        Node.js: (v${api.node()}),
                        and Electron: (v${api.electron()})
                        `

document.getElementById("github-redirect")?.addEventListener("click", () => {
    window.api.openExternal("https://github.com/0kibob/sti2d.ldv-cansat")
})