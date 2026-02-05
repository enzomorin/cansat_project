const content = document.getElementById('content')
let actualPage = null

export async function changePage(page, params = {}, options = {}) {
    if (actualPage === page) { return } else { actualPage = page }

    const pathPage = `pages/${page}.html`
    const pathScript = `scripts/${page}.js`

    try {
        const response = await fetch(pathPage)
        const html = await response.text()
        content.innerHTML = html

        document.dispatchEvent(new CustomEvent('pagechanged', { detail: { page, params }}))

        try {
            const module = await import(`../${pathScript}?v=${Date.now()}`);
            if (module.default) { module.default({ params, options }); }
        } 
        catch (err) {}
    }
    catch (err) { content.innerHTML = `<p>Error loading page.  ${err}</p>`; }
}

export default { changePage }