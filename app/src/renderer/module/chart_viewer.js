const Chart = window.Chart

const PALETTE = [
    { line: "#36acfb", fill: "rgba(54,172,251,0.15)" },
    { line: "#7BA05B", fill: "rgba(123,160,91,0.15)" },
    { line: "#A9745B", fill: "rgba(169,116,91,0.15)" },
    { line: "#FF5C5C", fill: "rgba(255,92,92,0.15)"  },
    { line: "#9b59b6", fill: "rgba(155,89,182,0.15)" },
    { line: "#F2E394", fill: "rgba(242,227,148,0.3)" },
]

const STEP_NTH   = { "1": 1, "5": 5, "10": 10, "30": 30, "60": 60, "300": 300 }
const MONO_FONT  = { family: "'IBM Plex Mono', monospace", size: 10 }
const MONO_FONT_SM = { family: "'IBM Plex Mono', monospace", size: 11 }
const AXIS_COLOR = "#5f6b7a"
const GRID_COLOR = "rgba(27,59,111,0.06)"
const PX_PER_POINT = 14  // min pixels between data points for scroll

// ── CSV Parser ────────────────────────────────────────
export function parseCSV(content) {
    const lines   = content.split(/\r?\n/).filter(l => l.trim())
    const headers = parseCSVLine(lines[0])
    const rows    = lines.slice(1).filter(l => l.trim()).map(parseCSVLine)
    return { headers, rows }
}

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

// ── Helpers ───────────────────────────────────────────
function applyStep(rows, step) {
    const nth = STEP_NTH[step] ?? 1
    return nth <= 1 ? rows : rows.filter((_, i) => i % nth === 0)
}

function formatXLabel(value, xCol) {
    if (xCol === "mission_time_s") return `${value}s`
    if (xCol === "timestamp")      return String(value).split(" ")[1] ?? value
    return value
}

function axisTitle(text) {
    return { display: true, text, color: AXIS_COLOR, font: MONO_FONT_SM }
}

function axisTicks(extra = {}) {
    return { color: AXIS_COLOR, font: MONO_FONT, ...extra }
}

// ── Chart Viewer ──────────────────────────────────────
export class ChartViewer {
    #chart    = null
    #canvas   = null
    #datasets = []

    constructor(canvasId) {
        this.#canvas = document.getElementById(canvasId)
    }

    setDataset(id, label, content) {
        const parsed   = parseCSV(content)
        const existing = this.#datasets.findIndex(d => d.id === id)
        if (existing >= 0)
            this.#datasets[existing] = { id, label, ...parsed }
        else
            this.#datasets.push({ id, label, ...parsed })
    }

    removeDataset(id) {
        this.#datasets = this.#datasets.filter(d => d.id !== id)
    }

    clear() {
        this.#datasets = []
        this.#chart?.destroy()
        this.#chart = null
        // Reset canvas size
        if (this.#canvas) {
            this.#canvas.style.width  = "100%"
            this.#canvas.style.height = "100%"
        }
    }

    hasData()     { return this.#datasets.length > 0 }
    getDatasets() { return this.#datasets }

    getHeaders() {
        return this.#datasets[0]?.headers ?? []
    }

    getDataColumns() {
        return this.getHeaders().filter(h => h !== "timestamp")
    }

    render({ xCol, yCols = [], step = "10", type = "area" } = {}) {
        if (!this.#datasets.length || !xCol || !yCols.length) return []

        const chartType = type === "bar" ? "bar" : "line"
        const fill      = type === "area"

        // Reference timeline from first dataset
        const ref    = this.#datasets[0]
        const refXi  = ref.headers.indexOf(xCol)
        const refRows = applyStep(ref.rows, step)
        const labels  = refRows.map(r => formatXLabel(r[refXi] ?? "", xCol))

        // ── Dynamic canvas width for horizontal scroll ─
        const wrapper  = this.#canvas.parentElement
        const minWidth = wrapper?.clientWidth ?? 600
        const dataWidth = Math.max(labels.length * PX_PER_POINT, minWidth)

        this.#canvas.style.width  = `${dataWidth}px`
        this.#canvas.style.height = "100%"
        this.#canvas.width        = dataWidth

        // ── Build datasets ─────────────────────────────
        const datasets  = []
        let colorIndex  = 0

        this.#datasets.forEach(dataset => {
            const xi   = dataset.headers.indexOf(xCol)
            const rows = applyStep(dataset.rows, step)

            yCols.forEach(yCol => {
                const yi = dataset.headers.indexOf(yCol)
                if (xi < 0 || yi < 0) return

                const color = PALETTE[colorIndex++ % PALETTE.length]
                const data  = rows.map(r => {
                    const v = parseFloat(r[yi])
                    return isNaN(v) ? null : v
                })

                datasets.push({
                    label:            this.#datasets.length > 1 ? `${dataset.label} — ${yCol}` : yCol,
                    data,
                    borderColor:      color.line,
                    backgroundColor:  fill ? color.fill : color.line,
                    fill,
                    tension:          0.3,
                    pointRadius:      rows.length > 300 ? 0 : 2,
                    pointHoverRadius: 4,
                    borderWidth:      1.5,
                    spanGaps:         true,
                })
            })
        })

        this.#chart?.destroy()

        const yLabel = yCols.length === 1 ? yCols[0] : "Value"

        this.#chart = new Chart(this.#canvas, {
            type: chartType,
            data: { labels, datasets },
            options: {
                responsive:          false,  // ← must be false for fixed-width scroll
                maintainAspectRatio: false,
                animation:           { duration: 300, easing: "easeInOutQuart" },
                interaction:         { mode: "index", intersect: false },
                plugins: {
                    legend:  { display: false },
                    tooltip: {
                        backgroundColor: "rgba(14,28,44,0.95)",
                        titleColor:      "#36acfb",
                        bodyColor:       "#f7f8fa",
                        borderColor:     "rgba(54,172,251,0.25)",
                        borderWidth:     1,
                        padding:         10,
                        cornerRadius:    6,
                        callbacks: {
                            title: items => `${xCol}: ${items[0].label}`,
                            label: item  => ` ${item.dataset.label}: ${item.parsed.y?.toFixed(2) ?? "—"}`
                        }
                    }
                },
                scales: {
                    x: {
                        title: axisTitle(xCol),
                        ticks: axisTicks({
                            maxTicksLimit: Math.floor(dataWidth / 80),
                            maxRotation:   0,
                        }),
                        grid: { color: GRID_COLOR }
                    },
                    y: {
                        title: axisTitle(yLabel),
                        ticks: axisTicks(),
                        grid:  { color: GRID_COLOR }
                    }
                }
            }
        })

        if (wrapper) requestAnimationFrame(() => {
            wrapper.scrollLeft = wrapper.scrollWidth
        })

        return datasets
    }
}