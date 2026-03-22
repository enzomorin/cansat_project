let activeActionMenu = null
let activeButton = null

export function attach(parent, { items = [], position = 'bottom-left', onOpen, onClose }) {
    function open() {
        activeActionMenu?.()
        const actionMenu = document.createElement('div')
        actionMenu.className = `action-menu ${position}`
        actionMenu.style.zIndex = '10000'

        items.forEach(item => {
            const button = document.createElement('button')
            button.className = 'md'
            if (item.icon) {
                const icon = document.createElement("i")
                icon.setAttribute("data-lucide", item.icon)
                button.appendChild(icon)
            }
            if (item.content) button.appendChild(document.createTextNode(item.content))

            button.addEventListener("click", event => {
                event.stopPropagation()
                item.onClick?.()
                close()
            })
            actionMenu.appendChild(button)
        })

        document.body.appendChild(actionMenu)
        const rect = parent.getBoundingClientRect()
        actionMenu.style.top = position.includes('bottom') ? rect.bottom + 'px' : (rect.top - actionMenu.offsetHeight) + 'px'
        actionMenu.style.left = (rect.right - actionMenu.offsetWidth) + 'px'

        function close() {
            actionMenu.remove()
            document.removeEventListener("click", outsideClick)
            activeActionMenu = activeButton = null
            onClose?.()
        }
        function outsideClick(event) {
            if (!actionMenu.contains(event.target) && event.target !== parent) close()
        }

        document.addEventListener("click", outsideClick)
        activeActionMenu = close
        activeButton = parent
        onOpen?.()
    }

    parent.addEventListener("click", event => {
        event.stopPropagation()
        open()
    })
}
