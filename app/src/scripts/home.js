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

window.notif.success('Home Page Loaded', 'The home page has been loaded successfully.')