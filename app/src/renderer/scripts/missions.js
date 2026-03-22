const TABLE_COLUMNS = ["name", "csv_file", "location", "radius", "mission_date", "duration"]

const COLUMN_LABELS = {
    mission_date: "DATE",
    csv_file:     "CSV FILE",
    default:      col => col.replace(/_/g, " ").toUpperCase()
}

export default async function initMissionsPage() {
    const container     = document.getElementById("missions-lists")
    const missionsBtn   = document.getElementById("missions-button")
    const trashBtn      = document.getElementById("trash-list-button")
    const refreshBtn    = document.getElementById("refresh-button")
    const newMissionBtn = document.getElementById("new-mission-button")
    const searchInput   = document.getElementById("search-missions")
    const currentTabEl  = document.getElementById("current-tab")

    let currentTab = "missions"
    let missions   = []

    const locationCache = new Map()

    // ---------- TAB LABEL ----------
    function updateTabLabel() {
        if (currentTabEl)
            currentTabEl.textContent = currentTab === "trash" ? "🗑 Trash" : "📋 Missions"
    }

    // ---------- STATE ----------
    function showState(icon, message, loading = false) {
        container.innerHTML = `
            <div class="state-card">
                ${loading
                    ? `<div class="loader"></div>`
                    : `<i data-lucide="${icon}"></i>`
                }
                ${message ? `<p>${message}</p>` : ""}
            </div>
        `
        window.lucideInitObserverTrigger?.()
    }

    // ---------- FORMAT ----------
    function formatValue(key, value) {
        if (key === "mission_date") return value ? new Date(value).toLocaleString() : ""
        if (key === "radius")       return value ? `${value} m` : "Not set"
        if (key === "duration")     return value ?? "Not set"
        return value ?? ""
    }

    function columnLabel(col) {
        return COLUMN_LABELS[col] ?? COLUMN_LABELS.default(col)
    }

    // ---------- LOCATION ----------
    async function resolveLocation(td, value) {
        if (!value) return

        if (locationCache.has(value)) {
            td.textContent = locationCache.get(value)
            return
        }

        const coords = window.geoco.parseCoordinates(value)
        if (!coords) return

        const place = await window.geoco.Geocode(coords.lat, coords.lon).catch(() => null)
        if (place) {
            locationCache.set(value, place)
            td.textContent = place
        }
    }

    // ---------- ACTIONS ----------
    async function handleMissionAction(id, action) {
        const endpoints = {
            softDelete: { url: `/soft-delete?id=${id}`, method: "PUT" },
            restore:    { url: `/restore?id=${id}`,     method: "PUT" },
            delete:     { url: `?id=${id}`,             method: "DELETE" }
        }

        try {
            await window.fetchAPI(endpoints[action].url, {
                method: endpoints[action].method,
                showNotif: true
            })
            await reload()
        } catch (err) {
            console.error("Mission action error:", err)
        }
    }

    async function downloadMissionCSV(mission) {
        try {
            const content = await window.fetchAPI(`/csv?id=${mission.id}`, { cache: false })

            const result = await window.api.saveCSVFile({
                content,
                suggestedName: mission.name
            })

            if (result.success)
                window.notif.success("CSV téléchargé", result.filePath, 3000)
            else if (result.error)
                window.notif.error("Erreur téléchargement", result.error, 4000)

        } catch (err) {
            window.notif.error("Erreur téléchargement", err.message, 4000)
        }
    }

    // ---------- ROW ----------
    function createMissionRow(mission) {
        const row = document.createElement("tr")

        TABLE_COLUMNS.forEach(key => {
            const td = document.createElement("td")
            td.textContent = formatValue(key, mission[key])
            if (key === "location") resolveLocation(td, mission[key])
            row.appendChild(td)
        })

        const actionsCell = document.createElement("td")
        const actionBtn   = document.createElement("button")
        actionBtn.className = "mission-action-button"
        actionBtn.innerHTML = `<i data-lucide="ellipsis"></i>`

        const menuItems = currentTab === "missions"
            ? [
                { content: "View",         icon: "eye",            onClick: () => window.page.change("compare", { missionId: mission.id }) },
                { content: "Move (trash)", icon: "trash-2",        onClick: () => handleMissionAction(mission.id, "softDelete") },
                { content: "Download CSV", icon: "download",       onClick: () => downloadMissionCSV(mission) }
            ]
            : [
                { content: "Restore",      icon: "archive-restore", onClick: () => handleMissionAction(mission.id, "restore") },
                { content: "Delete",       icon: "trash-2",         onClick: () => handleMissionAction(mission.id, "delete") }
            ]

        window.actionMenu.attach(actionBtn, { items: menuItems })
        actionsCell.appendChild(actionBtn)
        row.appendChild(actionsCell)
        return row
    }

    // ---------- TABLE ----------
    function renderTable(data) {
        container.innerHTML = ""

        if (!data.length)
            return showState("inbox", "No missions found")

        const table  = document.createElement("table")
        table.className = "missions-table"

        const thead     = document.createElement("thead")
        const headerRow = document.createElement("tr")

        TABLE_COLUMNS.forEach(col => {
            const th = document.createElement("th")
            th.textContent = columnLabel(col)
            headerRow.appendChild(th)
        })

        headerRow.appendChild(document.createElement("th"))
        thead.appendChild(headerRow)
        table.appendChild(thead)

        const tbody = document.createElement("tbody")
        data.forEach(mission => tbody.appendChild(createMissionRow(mission)))
        table.appendChild(tbody)
        container.appendChild(table)

        window.lucideInitObserverTrigger?.()
    }

    // ---------- FETCH ----------
    async function fetchMissions() {
        const endpoint = currentTab === "trash" ? "?include_deleted=true" : ""
        missions = await window.fetchAPI(endpoint, { cache: false }) ?? []
        renderTable(missions)
    }

    async function reload() {
        updateTabLabel()
        showState("", "Loading missions...", true)
        try {
            await fetchMissions()
        } catch (err) {
            showState("alert-triangle", err.message)
        }
    }

    // ---------- FILTER ----------
    function filterMissions(query) {
        if (!query) return renderTable(missions)

        const q = query.toLowerCase()
        const filtered = missions.filter(m => {
            if (m.name?.toLowerCase().includes(q)) return true
            const raw      = m.location?.toLowerCase() ?? ""
            const resolved = locationCache.get(m.location)?.toLowerCase() ?? ""
            return raw.includes(q) || resolved.includes(q)
        })

        renderTable(filtered)
    }

    // ---------- EVENTS ----------
    missionsBtn?.addEventListener("click",  () => { currentTab = "missions"; reload() })
    trashBtn?.addEventListener("click",     () => { currentTab = "trash";    reload() })
    refreshBtn?.addEventListener("click",   reload)
    searchInput?.addEventListener("input",  e => filterMissions(e.target.value))

    newMissionBtn?.addEventListener("click", () => {
        const state = window.missionManager.getState()
        if (!state?.active) { window.page.change("antenna"); return }
        window.missionManager.restoreNavigation()
    })

    await reload()
}