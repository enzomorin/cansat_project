export async function loadCSVViewer({ containerId, getCSV, blockSize = 50 }) {
    const container = document.getElementById(containerId)
    if (!container) return
    try {
        const result = await getCSV()

        if (!result?.success) {
            container.innerHTML = `
                <div class="csv-state csv-error">
                    <i data-lucide="alert-circle"></i>
                    <p>Erreur lors du chargement</p>
                    <small>${escapeHTML(result?.error ?? "Impossible de charger le CSV")}</small>
                </div>
            `
            window.api?.lucide?.render?.()
            return
        }

        const content = result.content ?? result.data ?? ""

        if (!content.trim()) {
            container.innerHTML = `
                <div class="csv-state csv-empty">
                    <i data-lucide="database"></i>
                    <p>Aucune donnée disponible</p>
                    <small>Le fichier CSV ne contient encore aucune ligne.</small>
                </div>
            `
            window.api?.lucide?.render?.()
            return
        }

        const lines = content
            .split(/\r?\n/)
            .filter(l => l.trim() !== "")

        if (!lines.length) {
            container.innerHTML = `
                <div class="csv-state csv-empty">
                    <i data-lucide="file-x"></i>
                    <p>Fichier vide</p>
                    <small>Aucune ligne détectée.</small>
                </div>
            `
            window.api?.lucide?.render?.()
            return
        }

        container.innerHTML = `
            <div class="csv-controls">
                <button id="scroll-top">↑ Aller en haut</button>
                <button id="scroll-bottom">↓ Aller en bas</button>
            </div>
            <div class="csv-wrapper">
                <table class="csv-table"></table>
            </div>
        `

        const wrapper = container.querySelector(".csv-wrapper")
        const table = container.querySelector(".csv-table")
        let currentIndex = 0

        const headerCols = lines[0].split(",")
        const header = document.createElement("tr")
        headerCols.forEach(col => {
            const th = document.createElement("th")
            th.textContent = col
            header.appendChild(th)
        })
        table.appendChild(header)
        currentIndex++

        function loadBlock() {
            const end = Math.min(currentIndex + blockSize, lines.length)
            for (; currentIndex < end; currentIndex++) {
                const tr = document.createElement("tr")
                lines[currentIndex].split(",").forEach(col => {
                    const td = document.createElement("td")
                    td.textContent = col
                    tr.appendChild(td)
                })
                table.appendChild(tr)
            }
        }
        loadBlock()

        wrapper.addEventListener("scroll", () => {
            if (wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 10) {
                if (currentIndex < lines.length) loadBlock()
            }
        })

        container.querySelector("#scroll-top").onclick = () => {
            wrapper.scrollTop = 0
        }

        container.querySelector("#scroll-bottom").onclick = () => {
            while (currentIndex < lines.length) loadBlock()
            wrapper.scrollTop = wrapper.scrollHeight
        }

    } catch (err) {
        container.innerHTML = `
            <div class="csv-state csv-error">
                <i data-lucide="alert-triangle"></i>
                <p>Erreur inattendue</p>
                <small>${escapeHTML(err.message)}</small>
            </div>
        `
        window.api?.lucide?.render?.()
    }
}

function escapeHTML(str = "") {
    return str.replace(/[&<>"']/g, m => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[m]))
}