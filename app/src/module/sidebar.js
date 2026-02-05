export function initSidebar(loadPage) {
    const sidebar = document.querySelector('[data-sidebar]')
    const buttons = document.querySelectorAll('[data-pagelink]')
    const toggle = document.querySelectorAll('[data-togglesidebar]')

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.getAttribute("data-pagelink")
            loadPage(page)
        })
    })

    document.addEventListener('pagechanged', (e) => {
        const { page, params } = e.detail
        buttons.forEach(button => {
            button.classList.toggle("active", button.getAttribute("data-pagelink") === page)
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
