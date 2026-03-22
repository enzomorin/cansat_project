const content = document.getElementById('content')
let currentPage = null
const pageCache = new Map()
const scriptCache = new Map()

export async function changePage(page, params = {}, options = {}) {
    if (!content || currentPage === page) return

    const previousPage = currentPage
    currentPage = page

    try {
        // HTML cache
        let html = pageCache.get(page)
        if (!html) {
            const res = await fetch(`../renderer/pages/${page}.html`)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            html = await res.text()
            pageCache.set(page, html)
        }

        content.innerHTML = html

        await new Promise(requestAnimationFrame)
        window.lucideRenderContent?.()
        
        document.dispatchEvent(new CustomEvent('pagechanged', { detail: { page, params } }))

        // JS module cache
        let module = scriptCache.get(page)
        if (!module) {
            module = await import(`../scripts/${page}.js`)
            scriptCache.set(page, module)
        }

        module?.default?.({ params, options })
    } catch (err) {
        currentPage = previousPage
        content.innerHTML = `<p>Error loading page "${page}": ${err.message}</p>`
    }
}

export default { changePage }