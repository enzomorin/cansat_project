import * as L from "../../../node_modules/leaflet/dist/leaflet-src.esm.js"

let map = null
let missionCircle = null
let marker = null

const DEFAULT_RADIUS = 500 //in meters

export function initMap(containerId = "map-container") {
    if (map) { map.remove(); map = null; missionCircle = null; marker = null }

    const container = document.getElementById(containerId)
    if (!container || !document.contains(container)) return

    map = L.map(containerId).setView([48.8566, 2.3522], 13)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19
    }).addTo(map)

    map.on("click", handleMapClick)

    const ro = new ResizeObserver(() => {
        if (container.offsetWidth > 0) {
            map?.invalidateSize()
            ro.disconnect()
        }
    })
    ro.observe(container)

    setTimeout(() => map?.invalidateSize(), 200)
}

function handleMapClick(e) {
    const { lat, lng } = e.latlng
    setMissionLocation(lat, lng)
    window.dispatchEvent(new CustomEvent("map:location-selected", {
        detail: { lat, lon: lng }
    }))
}

export function setMissionLocation(lat, lon, radius = DEFAULT_RADIUS) {
    if (!map) return
    clearMission()

    marker = L.marker([lat, lon], { draggable: true }).addTo(map)

    missionCircle = L.circle([lat, lon], {
        radius,
        color: "#1b3b6f",
        fillColor: "#1b3b6f",
        fillOpacity: 0.2
    }).addTo(map)

    marker.on("drag", e => {
        const { lat, lng } = e.target.getLatLng()
        missionCircle.setLatLng([lat, lng])
        window.dispatchEvent(new CustomEvent("map:location-selected", {
            detail: { lat, lon: lng }
        }))
    })

    missionCircle.bindPopup(popupContent(radius))
    map.setView([lat, lon], 12)
}

export function setRadius(radius) {
    if (!missionCircle) return
    missionCircle.setRadius(radius)
    missionCircle.setPopupContent(popupContent(radius))
}

function popupContent(radius) {
    return `Rayon (${radius}m) — Surface\u00a0: ${formatArea(radius)}\u00a0m²`
}

export function getMission() {
    if (!missionCircle) return null
    const { lat, lng } = missionCircle.getLatLng()
    return { lat, lon: lng, radius: missionCircle.getRadius() }
}

export function refreshMap() {
    map?.invalidateSize()
}

function clearMission() {
    if (!map) return
    if (marker)        { map.removeLayer(marker);        marker = null }
    if (missionCircle) { map.removeLayer(missionCircle); missionCircle = null }
}

function formatArea(radius) {
    return Math.round(Math.PI * radius * radius).toLocaleString()
}