export function lucideInitObserverTrigger() {
    window.api.lucide.render()

    const observer = new MutationObserver((mutations) => {
        const hasIcon = mutations.some(
            m => Array.from(m.addedNodes).some(node => node.querySelector?.("i[data-lucide]"))
        )
        if (hasIcon) window.api.lucide.render();
    })

    observer.observe(document.body, {
        childList: true,
        subtree: true
    })
}