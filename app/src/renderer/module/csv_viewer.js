function parseCSVLine(line) {
    const result = []
    let current = "", inQuotes = false

    for (const char of line) {
        if (char === '"') inQuotes = !inQuotes
        else if (char === "," && !inQuotes) { result.push(current.trim()); current = "" }
        else current += char
    }

    result.push(current.trim())
    return result
}

function renderState(container, message, icon = "info") {
    container.innerHTML = `
        <div class="csv-state csv-error">
            <i data-lucide="${icon}"></i>
            <p>${message}</p>
        </div>
    `
    window.lucideInitObserverTrigger?.()
}

export async function loadCSVViewer({ containerId = "csv-viewer", getCSV, blockSize = 50 }) {
    const container = document.getElementById(containerId)
    if (!container) return

    try {
        const raw = await getCSV()

        const content = typeof raw === "string"
            ? raw
            : raw?.content ?? raw?.data ?? ""

        if (!content?.trim())
            return renderState(container, "CSV file is empty", "file-x")

        const lines = content.split(/\r?\n/).filter(l => l.trim())

        if (!lines.length)
            return renderState(container, "CSV file is empty", "file-x")

        container.innerHTML = `
            <div class="csv-controls">
                <button class="csv-top">↑ Top</button>
                <button class="csv-bottom">↓ Bottom</button>
            </div>
            <div class="csv-wrapper">
                <table class="csv-table">
                    <thead></thead>
                    <tbody></tbody>
                </table>
            </div>
        `

        const wrapper = container.querySelector(".csv-wrapper")
        const thead   = container.querySelector("thead")
        const tbody   = container.querySelector("tbody")
        const btnTop  = container.querySelector(".csv-top")
        const btnBottom = container.querySelector(".csv-bottom")

        const headers = parseCSVLine(lines[0])
        const rows    = lines.slice(1).filter(r => r.trim())
        let index     = 0

        // Header
        const headerRow = document.createElement("tr")
        headers.forEach(col => {
            const th = document.createElement("th")
            th.textContent = col
            headerRow.appendChild(th)
        })
        thead.appendChild(headerRow)

        function renderBlock() {
            if (index >= rows.length) return
            const fragment = document.createDocumentFragment()
            const end = Math.min(index + blockSize, rows.length)

            for (; index < end; index++) {
                const tr   = document.createElement("tr")
                const cols = parseCSVLine(rows[index])
                Array.from({ length: headers.length }, (_, i) => cols[i] ?? "").forEach(value => {
                    const td = document.createElement("td")
                    td.textContent = value
                    tr.appendChild(td)
                })
                fragment.appendChild(tr)
            }
            tbody.appendChild(fragment)
        }

        renderBlock()

        wrapper.addEventListener("scroll", () => {
            if (wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 20)
                renderBlock()
        })

        btnTop.onclick = () => (wrapper.scrollTop = 0)

        btnBottom.onclick = async () => {
            btnBottom.disabled = true
            while (index < rows.length) {
                renderBlock()
                await new Promise(r => setTimeout(r, 0))
            }
            wrapper.scrollTop = wrapper.scrollHeight
            btnBottom.disabled = false
        }

    } catch (err) {
        renderState(container, err.message, "alert-triangle")
    }
}