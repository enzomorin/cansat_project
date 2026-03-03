export function initSidebar(loadPage) {
    const sidebar = document.querySelector('[data-sidebar]')
    const buttons = document.querySelectorAll('[data-pagelink]')
    const toggle = document.querySelectorAll('[data-togglesidebar]')

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.getAttribute("data-pagelink").split(',')[0].trim()
            loadPage(page)
        })
    })

    document.addEventListener('pagechanged', (e) => {
        const { page, params } = e.detail
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
