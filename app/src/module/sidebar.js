export function initSidebar(loadPage) {
    const sidebar = document.querySelector('[data-sidebar]')
    const buttons = document.querySelectorAll('[data-pagelink]')
    const toggle = document.querySelectorAll('[data-togglesidebar]')

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const pages = button.getAttribute("data-pagelink").split(',').map(p => p.trim())
            if (pages.includes("antenna")) {
                if (window.missionManager.isActive()) {
                    window.missionManager.restoreNavigation()
                } else {
                    loadPage("antenna")
                }
                return
            }

            loadPage(pages[0])
        })
    })

    document.addEventListener('pagechanged', (e) => {
        const { page } = e.detail
        buttons.forEach(button => {
            const linkedPages = button.getAttribute("data-pagelink").split(',').map(p => p.trim())
            button.classList.toggle("active", linkedPages.includes(page))
        })
    })

    toggle.forEach(button => {
        button.addEventListener("click", () => {
            const collapsedSidebar = sidebar.getAttribute("data-sidebar-state") === "collapsed"
            sidebar.setAttribute('data-sidebar-state', collapsedSidebar? "expanded" : "collapsed")
        })
    })
}

export default { initSidebar }
