import { createIcons, icons } from "../../../node_modules/lucide/dist/esm/lucide/src/lucide.js"

const RENDER_CONFIG = { icons, attrs: { "stroke-width": 2 }, nameAttr: "data-lucide" }

let observer = null
let rafPending = false
const pending = new Set()

function renderIcons(root = document.body) {
    createIcons({ ...RENDER_CONFIG, root })
}

function flushPending() {
    rafPending = false
    for (const root of pending) renderIcons(root)
    pending.clear()
}

function handleMutations(mutations) {
    for (const { addedNodes } of mutations) {
        for (const node of addedNodes) {
            if (!(node instanceof HTMLElement)) continue
            if (node.matches("i[data-lucide]") || node.querySelector("i[data-lucide]"))
                pending.add(node)
        }
    }
    if (pending.size && !rafPending) {
        rafPending = true
        requestAnimationFrame(flushPending)
    }
}

export function lucideInitObserverTrigger() {
    renderIcons(document.body)
    if (observer) return
    observer = new MutationObserver(handleMutations)
    observer.observe(document.body, { childList: true, subtree: true })
}

export function lucideRenderContent() {
    const content = document.getElementById("content")
    if (content) renderIcons(content)
}

window.lucideRenderContent = lucideRenderContent