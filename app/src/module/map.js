import * as L from "../../node_modules/leaflet/dist/leaflet-src.esm.js"

let map = null
let currentShape = null
let shapes = []
let marker = null

let currentTool = "marker"
let rectangleStart = null

const tool_config = {
    marker: {
        name: "Mission location"
    },
    circle: {
        name: "Mission radius",
        radius: 50
    },
    rectangle: {
        name: "Mission zone"
    },
    polygon: {
        name: "Mission area"
    }
}

export function initMap(containerId = "map-container") {
    const container = document.getElementById(containerId)

    if (!container) return

    map = L.map(containerId).setView([48.8566, 2.3522], 13)
    setTimeout(() => map.invalidateSize(), 200)
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "&copy; OpenStreetMap contributors" }
    ).addTo(map)

    map.on("click", handleMapClick)
}

function handleMapClick(e) {
    const lat = e.latlng.lat
    const lon = e.latlng.lng

    switch (currentTool) {
        case "marker":
            setMarker(lat, lon)
            break

        case "circle":
            drawCircle(lat, lon)
            break

        case "rectangle":
            drawRectangle(lat, lon)
            break
    }

    window.dispatchEvent(
        new CustomEvent("map:location-selected", { detail: { lat, lon } })
    )
}

export function setTool(tool) { currentTool = tool }
export function getTool() { return currentTool }

export function setMarker(lat, lon) {
    if (!map) return

    clearCurrentShape()
    const name = tool_config.marker.name
    const m = L.marker([lat, lon], { title: name }).addTo(map)
    m.bindPopup(name).openPopup()
    currentShape = m
    marker = m

    map.setView([lat, lon], 15)
}

export function drawCircle(lat, lon) {
    if (!map) return

    clearCurrentShape()
    const name = tool_config.circle.name
    const radius = tool_config.circle.radius
    const circle = L.circle([lat, lon], {
        radius: radius,
        color: "#1b3b6f",
        fillColor: "#1b3b6f",
        fillOpacity: 0.2
    }).addTo(map)
    circle.bindPopup(name)
    currentShape = circle
    map.setView([lat, lon], 15)

    return circle
}

export function drawRectangle(lat, lon) {
    if (!map) return

    if (!rectangleStart) {
        rectangleStart = [lat, lon]
        return
    }
    const bounds = [
        rectangleStart,
        [lat, lon]
    ]
    const name = tool_config.rectangle.name
    const rectangle = L.rectangle(bounds, {
        color: "#ff7800",
        weight: 2
    }).addTo(map)
    rectangle.bindPopup(name).openPopup()
    shapes.push(rectangle)
    rectangleStart = null

    return rectangle
}

export function drawPolygon(points) {
    if (!map) return

    const name = tool_config.polygon.name
    const polygon = L.polygon(points, {
        color: "#2ecc71"
    }).addTo(map)
    polygon.bindPopup(name)
    shapes.push(polygon)

    return polygon
}

function clearCurrentShape() {
    if (!map) return

    if (currentShape) {
        map.removeLayer(currentShape)
        currentShape = null
    }
}

export function clearShapes() {
    shapes.forEach(shape => map.removeLayer(shape))
    shapes = []
}

export function refreshMap() {
    if (!map) return
    map.invalidateSize()
    if (marker) marker.addTo(map)
    shapes.forEach(s => s.addTo(map))
}