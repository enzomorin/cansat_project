let activeActionMenu = null
let activeButton = null

export function attach(parent, { items = [], position = 'bottom-left', onOpen, onClose }) {
    function open() {
        if (activeButton === parent) {
            activeActionMenu?.()
            return
        }

        activeActionMenu?.()

        const actionMenu = document.createElement('div')
        actionMenu.className = `action-menu ${position}`
        actionMenu.style.zIndex = "10000"

        items.forEach(item => {
            const button = document.createElement('button')
            button.className = 'md'
            if (item.icon) {
                const icon = document.createElement("i")
                icon.setAttribute("data-lucide", item.icon)
                button.appendChild(icon)
            }
            if (item.content) {
                const text = document.createElement("span")
                text.textContent = item.content
                button.appendChild(text)
            }

            button.addEventListener("click", (event) => {
                event.stopPropagation()
                item.onClick?.()
                close()
            })

            actionMenu.appendChild(button)
        })

        document.body.appendChild(actionMenu)
        const rect = parent.getBoundingClientRect()
        const menuWidth = actionMenu.offsetWidth

        if (position === "bottom-left") {
            actionMenu.style.top = rect.bottom + "px"

            actionMenu.style.left = (rect.right - menuWidth) + "px"
        } if (position === "top-left") {
            actionMenu.style.top = (rect.top - actionMenu.offsetHeight) + "px"
            actionMenu.style.left = (rect.right - menuWidth) + "px"
        }

        function close() {
            actionMenu.remove()
            document.removeEventListener("click", outsideClick)
            activeActionMenu = null
            activeButton = null
            onClose?.()
        }

        function outsideClick(event) {
            if (!actionMenu.contains(event.target) && event.target !== parent) {
                close()
            }
        }

        document.addEventListener("click", outsideClick)
        activeActionMenu = close
        activeButton = parent
        onOpen?.()
    }

    parent.addEventListener("click", (event) => {
        event.stopPropagation()
        open()
    })
}
