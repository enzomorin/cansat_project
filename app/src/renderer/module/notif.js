const container = document.getElementById("notif-container")
const LIMIT = 3

const TYPE_ICONS = {
    success: "check-circle",
    error:   "x-circle",
    info:    "info"
}

export function createNotif(title, message = null, duration = 3000, type = "info") {
    if (container.children.length >= LIMIT) {
        const oldest = container.firstChild
        oldest.classList.remove("visible")
        setTimeout(() => oldest.remove(), 300)
    }

    const notif = document.createElement("div")
    notif.className = `notif ${type}`

    const main = document.createElement("div")
    main.className = "main"

    const icon = document.createElement("i")
    icon.setAttribute("data-lucide", TYPE_ICONS[type] ?? "info")

    const titleEl = document.createElement("div")
    titleEl.className = "title"
    titleEl.textContent = title

    main.append(icon, titleEl)
    notif.appendChild(main)

    if (message) {
        const msgEl = document.createElement("p")
        msgEl.className = "message"
        msgEl.textContent = message
        notif.appendChild(msgEl)
    }

    const progress    = document.createElement("div")
    progress.className = "notif-progress"
    const progressBar = document.createElement("div")
    progressBar.className = "notif-progress-bar"
    progress.appendChild(progressBar)
    notif.appendChild(progress)

    let rafId       = null
    let startTime   = null
    let elapsed     = 0
    let paused      = false

    function animate(timestamp) {
        if (!startTime) startTime = timestamp
        const total = elapsed + (timestamp - startTime)
        const ratio = Math.min(total / duration, 1)

        progressBar.style.width = `${(1 - ratio) * 100}%`

        if (ratio < 1) {
            rafId = requestAnimationFrame(animate)
        } else {
            dismiss()
        }
    }

    function start() {
        if (paused) return
        startTime = null
        rafId = requestAnimationFrame(animate)
    }

    function pause() {
        if (rafId) {
            cancelAnimationFrame(rafId)
            rafId = null
        }
        const width = parseFloat(progressBar.style.width) / 100
        elapsed = duration * (1 - width)
        paused = true
    }

    function resume() {
        paused = false
        startTime = null
        rafId = requestAnimationFrame(animate)
    }

    function dismiss() {
        cancelAnimationFrame(rafId)
        notif.classList.remove("visible")
        setTimeout(() => notif.remove(), 300)
    }

    notif.addEventListener("mouseenter", pause)
    notif.addEventListener("mouseleave", resume)
    notif.addEventListener("click", dismiss)

    container.appendChild(notif)

    window.lucideInitObserverTrigger?.()

    requestAnimationFrame(() => {
        notif.classList.add("visible")
        start()
    })

    return { dismiss }
}

export const success = (title, message = null, duration = 3000) =>
    createNotif(title, message, duration, "success")

export const error = (title, message = null, duration = 3000) =>
    createNotif(title, message, duration, "error")

export const info = (title, message = null, duration = 3000) =>
    createNotif(title, message, duration, "info")

export default { createNotif, success, error, info }