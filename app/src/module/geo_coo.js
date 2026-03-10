const cache = new Map()

export function parseCoordinates(str) {
    if (!str) return null

    const parts = str.split(",")

    if (parts.length !== 2) return null

    const lat = parseFloat(parts[0].trim())
    const lon = parseFloat(parts[1].trim())

    if (isNaN(lat) || isNaN(lon)) return null

    return { lat, lon }
}

export async function Geocode(lat, lon) {
    try {
        const key = `${lat},${lon}`
        if (cache.has(key)) return cache.get(key)

        const url =
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
        const res = await fetch(url, {headers: {"User-Agent": "hydrovinci-electron"}})
        const data = await res.json()

        if (!data?.address) return key

        const addr = data.address
        const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.hamlet ||
            ""
        const state = addr.state || ""
        const country = addr.country || ""
        const place = [city, state, country].filter(Boolean).join(", ")

        cache.set(key, place)

        return place

    } catch (err) {
        console.error("Geocode error:", err)
        return key
    }
}

export async function resolveLocations(missions) {
    for (const mission of missions) {
        const coords = parseCoordinates(mission.location)
        if (!coords) continue

        try {
            const place = await Geocode(coords.lat, coords.lon)
            mission.location = place || mission.location
        } catch {}
        await new Promise(r => setTimeout(r, 1100))
    }
}