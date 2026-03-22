const DEFAULT_Y_COLS = new Set(["temperature_C", "pressure_hPa", "depth_m", "altitude_m"])

export default async function initComparePage({ params } = {}) {
    const addMissionBtn   = document.getElementById("add-mission-btn")
    const addFileBtn      = document.getElementById("add-file-btn")
    const clearBtn        = document.getElementById("clear-btn")
    const xColSelect      = document.getElementById("x-col-select")
    const yCheckboxes     = document.getElementById("y-col-checkboxes")
    const stepSelect      = document.getElementById("step-select")
    const chartTypeSelect = document.getElementById("chart-type-select")
    const legendEl        = document.getElementById("compare-legend")
    const emptyEl         = document.getElementById("compare-empty")
    const quitBtn         = document.getElementById("quit-btn")

    const [{ ChartViewer }, { loadCSVViewer }] = await Promise.all([
        window.chartViewer.load(),
        window.csvViewer.load()
    ])

    const viewer    = new ChartViewer("compare-chart")
    const loadedIds = new Set()
    let idCounter   = 0

    // ── Config ────────────────────────────────────────
    function getConfig() {
        return {
            xCol:  xColSelect.value,
            yCols: [...yCheckboxes.querySelectorAll("input:checked")].map(cb => cb.value),
            step:  stepSelect.value,
            type:  chartTypeSelect.value
        }
    }

    // ── Update controls ───────────────────────────────
    function updateControls() {
        const headers  = viewer.getHeaders()
        const dataCols = viewer.getDataColumns()
        const prevX    = xColSelect.value
        const prevYs   = new Set([...yCheckboxes.querySelectorAll("input:checked")].map(cb => cb.value))

        // X select
        xColSelect.innerHTML = headers
            .map(h => `<option value="${h}" ${h === prevX ? "selected" : ""}>${h}</option>`)
            .join("")

        if (!prevX)
            xColSelect.value = headers.includes("mission_time_s") ? "mission_time_s" : headers[0] ?? ""

        xColSelect.disabled = false

        // Y checkboxes
        yCheckboxes.innerHTML = ""
        dataCols.forEach(col => {
            const checked = prevYs.has(col) ||
                (prevYs.size === 0 && col !== xColSelect.value && DEFAULT_Y_COLS.has(col))

            const label = document.createElement("label")
            label.className = "y-checkbox"
            label.innerHTML = `<input type="checkbox" value="${col}" ${checked ? "checked" : ""}><span>${col}</span>`
            label.querySelector("input").addEventListener("change", render)
            yCheckboxes.appendChild(label)
        })
    }

    // ── Render ────────────────────────────────────────
    function render() {
        const hasData = viewer.hasData()
        emptyEl.style.display = hasData ? "none" : "flex"
        if (!hasData) return

        const config = getConfig()
        if (!config.xCol || !config.yCols.length) return

        renderLegend(viewer.render(config))
    }

    // ── Legend ────────────────────────────────────────
    function renderLegend(datasets) {
        legendEl.innerHTML = ""
        datasets?.forEach(ds => {
            const item = document.createElement("div")
            item.className = "legend-item"
            item.innerHTML = `
                <span class="legend-dot" style="background:${ds.borderColor}"></span>
                <span class="legend-label">${ds.label}</span>
            `
            legendEl.appendChild(item)
        })
    }

    // ── CSV viewer ────────────────────────────────────
    function renderCSV(content) {
        loadCSVViewer({ containerId: "csv-viewer", getCSV: () => content })
    }

    // ── Load helpers ──────────────────────────────────
    function afterLoad(content) {
        updateControls()
        render()
        renderCSV(content)
    }

    async function loadFromMission(missionId, label) {
        const id = `mission-${missionId}`
        if (loadedIds.has(id)) { window.notif.info("Mission déjà chargée", null, 2000); return }

        try {
            const content = await window.fetchAPI(`/csv?id=${missionId}`, { cache: false })
            viewer.setDataset(id, label, content)
            loadedIds.add(id)
            afterLoad(content)
            window.notif.success(`Mission chargée : ${label}`, null, 2000)
        } catch (err) {
            window.notif.error("Erreur chargement", err.message, 4000)
        }
    }

    async function loadFromFile() {
        const filePath = await window.api.openCSVFile()
        if (!filePath) return

        const result = await window.api.readCSVFile(filePath)
        if (!result.success) { window.notif.error("Erreur lecture", result.error, 4000); return }

        const id    = `file-${++idCounter}`
        const label = filePath.split(/[\\/]/).pop().replace(/\.csv$/i, "")

        viewer.setDataset(id, label, result.content)
        loadedIds.add(id)
        afterLoad(result.content)
        window.notif.success(`Fichier chargé : ${label}`, null, 2000)
    }

    async function pickMission() {
        try {
            const missions = await window.fetchAPI("", { cache: false })
            if (!missions?.length) { window.notif.info("Aucune mission disponible", null, 2000); return }

            const mission = missions.find(m => !loadedIds.has(`mission-${m.id}`))
            if (!mission)  { window.notif.info("Toutes les missions sont déjà chargées", null, 2000); return }

            await loadFromMission(mission.id, mission.name)
        } catch (err) {
            window.notif.error("Erreur", err.message, 4000)
        }
    }

    // ── Auto-load from mission list navigation ────────
    if (params?.missionId) {
        try {
            const missions = await window.fetchAPI(`?id=${params.missionId}`, { cache: false })
            const mission  = missions?.[0]
            if (mission) await loadFromMission(mission.id, mission.name)
        } catch (err) {
            window.notif.error("Erreur chargement mission", err.message, 4000)
        }
    }

    // ── Clear ─────────────────────────────────────────
    function clearAll() {
        viewer.clear()
        loadedIds.clear()
        xColSelect.innerHTML  = "<option value=''>— load data —</option>"
        xColSelect.disabled   = true
        yCheckboxes.innerHTML = "<span class='axis-empty'>— load data —</span>"
        legendEl.innerHTML    = ""
        const csv = document.getElementById("csv-viewer")
        if (csv) csv.innerHTML = ""
        render()
    }

    // ── Events ────────────────────────────────────────
    addMissionBtn?.addEventListener("click",    pickMission)
    addFileBtn?.addEventListener("click",       loadFromFile)
    clearBtn?.addEventListener("click",         clearAll)
    xColSelect?.addEventListener("change",      render)
    stepSelect?.addEventListener("change",      render)
    chartTypeSelect?.addEventListener("change", render)
    quitBtn?.addEventListener("click",          () => window.page.change("home"))
}