const missionsButton = document.getElementById('missions-button')
const trashButton = document.getElementById('trash-list-button')
const currentTabSpan = document.getElementById("current-tab")

const searchInput = document.getElementById('search-missions')
const refreshButton = document.getElementById('refresh-button')
const newMissionButton = document.getElementById('new-mission-button')
const missionsContainer = document.getElementById('missions-lists')

const tabs = {
    missions: missionsButton,
    trash: trashButton
}
let currentTab = 'missions'
let missionsCache = []

function switchTab(tabName) {
    if (currentTab === tabName) return
    currentTab = tabName

    Object.keys(tabs).forEach(key => {
        if (key === tabName) {
            tabs[key].classList.add('missions')
        } else {
            tabs[key].classList.remove('missions')
        }
    })

    loadMissionsForTab(tabName)
}

function updateCurrentTabLabel(tabName) {
    if (!currentTabSpan) return

    if (tabName === "missions") {
        currentTabSpan.textContent = "Showing: Active"
    } else if (tabName === "trash") {
        currentTabSpan.textContent = "Showing: Deleted"
    }
}

missionsButton?.addEventListener('click', () => switchTab('missions'))
trashButton?.addEventListener('click', () => switchTab('trash'))
refreshButton?.addEventListener('click', () => { loadMissionsForTab(currentTab) })
newMissionButton?.addEventListener('click', () => { 
    const state = window.missionManager.getState()
    if (!state?.active) {
        window.page.change('antenna')
        return
    }

    window.missionManager.restoreNavigation()
})
searchInput?.addEventListener('input', () => { updateMissionView() })

function filterMissions(query) {
    if (!missionsCache || missionsCache.length === 0) return []

    query = query.toLowerCase()

    return missionsCache.filter(mission =>
        mission.name.toLowerCase().includes(query) ||
        (mission.location && mission.location.toLowerCase().includes(query))
    )
}

function updateMissionView() {
    const query = searchInput?.value

    if (query) {
        const filtered = filterMissions(query)

        if (filtered.length === 0) {
            setMissionState({
                variant: "empty",
                icon: "inbox",
                html: 'No missions match your search.'
            })
        } else {
            appendMissions(filtered)
        }
    } else {
        appendMissions(missionsCache)
    }
}

async function loadMissionsForTab(currentTab) {
    missionsCache = []

    updateCurrentTabLabel(currentTab)
    throwLoaderText()

    let endpoint = ""
    if (currentTab === 'trash') endpoint = "?include_deleted=true"

    try {
        const missions = await window.fetchAPI(endpoint, "GET", false)

        if (!missions || !missions.success || !Array.isArray(missions.data) || missions.data.length === 0) {
            missionsCache = []
            throwNoMissionText(currentTab)
            return
        }

        missionsCache = missions.data
        updateMissionView()
    }
    catch (err) {
        throwErrorText(err)
    }
}

function setMissionState({ variant = "", icon = null, html = "", withLoader = false }) {
    missionsContainer.innerHTML = ""

    const state = document.createElement("div")
    state.className = "missions-state"

    const card = document.createElement("div")
    card.className = `missions-state-card ${variant}`

    if (withLoader) {
        const loaderContainer = document.createElement("div")
        loaderContainer.className = "loader-container"

        const loader = document.createElement("i")
        loader.setAttribute("data-lucide", "loader")
        loader.className = "loader"

        loaderContainer.appendChild(loader)
        card.appendChild(loaderContainer)
    }

    if (icon) {
        const i = document.createElement("i")
        i.setAttribute("data-lucide", icon)
        card.appendChild(i)
    }

    if (html) {
        const text = document.createElement("p")
        text.innerHTML = html
        card.appendChild(text)
    }

    state.appendChild(card)
    missionsContainer.appendChild(state)

    window.lucide?.replace()
}

function throwLoaderText() {
    setMissionState({
        withLoader: true
    })
}

function throwNoMissionText(tab) {
    setMissionState({
        variant: "empty",
        icon: "inbox",
        html:
            tab === "missions"
                ? 'No missions yet.<br>Click <strong>“New Mission”</strong> to create one.'
                : "No deleted missions."
    })
}

function throwErrorText(error) {
    setMissionState({
        variant: "error",
        icon: "alert-triangle",
        html: `
            <strong>Failed to load missions</strong><br>
            Please try again later.<br><br>
            <small>${error}</small>
        `
    })
}

function appendMissions(missions) {
    missionsContainer.innerHTML = null

    const table = document.createElement('table')
    table.className = 'missions-table'

    const columnOrder = ['name', 'csv_file', 'location', 'mission_date', 'duration']

    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr')
    columnOrder.forEach(key => {
        const th = document.createElement('th')
        th.textContent = key === 'mission_date' ? 'DATE'
                        : key.replace('_', ' ').toUpperCase()
        headerRow.appendChild(th)
    })
    const thAction = document.createElement('th')
    thAction.textContent = 'Actions'
    headerRow.appendChild(thAction)
    thead.appendChild(headerRow)
    table.appendChild(thead)

    const tbody = document.createElement('tbody')
    missions.forEach(mission => {
        const row = document.createElement('tr')

        columnOrder.forEach(key => {
            const td = document.createElement('td')
            let value = mission[key]

            if (key === 'mission_date') {
                value = new Date(value).toLocaleString()
            } else if (key === 'duration' && !value) {
                value = 'Not set'
            }

            td.textContent = value
            row.appendChild(td)
        })

        const tdButton = document.createElement('td')
        const button = document.createElement('button')
        button.className = 'mission-action-button'
        button.setAttribute('arial-level', "More options")
        button.innerHTML = '<i data-lucide="ellipsis"></i>'

        if (currentTab === 'missions') {
            window.actionMenu.attach(button, {
                items: [
                    { content: 'View', icon: "eye", onClick: () => window.page.change('compare', { missionId: mission.id }) },
                    { content: 'Delete', icon: "trash-2", onClick: () => MarkMission(mission.id) }
                ]
            })
        } else if (currentTab === 'trash') {
            window.actionMenu.attach(button, {
                items: [
                    { content: 'Restore', icon: "archive-restore", onClick: () => RestoreMission(mission.id) },
                    { content: 'Delete', icon: "trash-2", onClick: () => DeleteMission(mission.id) }
                ]
            })
        }

        tdButton.appendChild(button)
        row.appendChild(tdButton)

        tbody.appendChild(row)
    })

    table.appendChild(tbody)
    missionsContainer.appendChild(table)

    if (window.lucide) window.lucide.replace()
}

async function MarkMission(mission_id) {
    await window.fetchAPI(
        `/soft-delete?id=${mission_id}`,
        "PUT",
        true,
        `Mission #${mission_id} moved to trash`,
        `Error moving mission #${mission_id} to trash`
    )
    loadMissionsForTab(currentTab)
}

async function RestoreMission(mission_id) {
    await window.fetchAPI(
        `/restore?id=${mission_id}`,
        "PUT",
        true,
        `Mission #${mission_id} restored`,
        `Error restoring mission #${mission_id}`
    )
    loadMissionsForTab(currentTab)
}

async function DeleteMission(mission_id) {
    await window.fetchAPI(
        `/?id=${mission_id}`,
        "DELETE",
        true,
        `Mission #${mission_id} permanently deleted`,
        `Error deleting mission #${mission_id}`
    )
    loadMissionsForTab(currentTab)
}

loadMissionsForTab(currentTab)