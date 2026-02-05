import { lucideInitObserverTrigger } from './module/lucide.js'
import { initSidebar } from './module/sidebar.js'
import { changePage } from './module/pages.js'

import * as notif from './module/notif.js'

window.page ??= {}
window.page.change = changePage
window.notif = notif

lucideInitObserverTrigger()
initSidebar(window.page.change)

window.api.onSerialConnected(() => {
    window.page.change('data_port')
})

window.api.onSerialDisconnected(() => {
    window.notif.error('Port série déconnecté', null, 3000)
    window.page.change('home')
})

window.api.onSerialError((message) => notif.error('Erreur série', message, 3000))
window.api.onSerialWarning((message) => notif.info('Port série', message, 2000))
window.api.onSerialConnected(() => notif.success('Port série connecté', null, 3000))

//console.log = (...args) => notif.info('Info', args.join(' '), 3000)
//console.warn = (...args) => notif.info('Avertissement', args.join(' '), 4000)
//console.error = (...args) => notif.error('Erreur', args.join(' '), 5000)

window.page.change("home");