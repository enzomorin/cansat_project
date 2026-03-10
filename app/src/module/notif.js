const container = document.getElementById('notif-container');
const limit = 3

function creatIcon(type) {
    switch (type) {
        case 'success': return 'check-circle'
        case 'error': return 'x-circle'
        case 'info': default: return 'info'
    }
}

export function creatNotif(title, message = null, duration = 3000, type = 'info') {
    if (container.children.length >= limit) {
        const oldestNotif = container.firstChild;
        oldestNotif.classList.remove('visible');
        setTimeout(() => oldestNotif.remove(), 300);
    }

    const notif = document.createElement('div')
    notif.classList.add('notif', type)

    const notifMain = document.createElement('div')
    notifMain.className = 'main'

    const notifIcon = document.createElement('i')
    notifIcon.setAttribute("data-lucide", creatIcon(type))

    const notifContent = document.createElement('div')
    notifContent.className = 'title'
    notifContent.textContent = title

    notifMain.appendChild(notifIcon)
    notifMain.appendChild(notifContent)

    notif.appendChild(notifMain)

    if (message) {
        const messageContainer = document.createElement('p')
        messageContainer.className = 'message'
        messageContainer.textContent = message
        notif.appendChild(messageContainer)
    }

    notif.addEventListener('click', () => dismiss())

    function dismiss() {
        notif.classList.remove('visible')
        setTimeout(() => notif.remove(), 300)
    }

    container.appendChild(notif)
    requestAnimationFrame(() => notif.classList.add('visible'))

    const timer = setTimeout(() => dismiss(), duration)
    return { dismiss: () => { clearTimeout(timer); dismiss(); } }
}

export const success = (title, message = null, duration) =>
    creatNotif(title, message, duration, 'success')

export const error = (title, message = null, duration) =>
    creatNotif(title, message, duration, 'error')

export const info = (title, message = null, duration) =>
    creatNotif(title, message, duration, 'info')

export default { creatNotif, success, error, info }