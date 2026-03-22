const cache = new Map()

export function parseCoordinates(str) {
    if (!str) return null

    const parts = str.split(",").map(s => parseFloat(s.trim()))
    if (parts.length !== 2 || parts.some(isNaN)) return null

    return { lat: parts[0], lon: parts[1] }
}

export async function Geocode(lat, lon) {
    const key = `${lat},${lon}`
    if (cache.has(key)) return cache.get(key)

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`, {
            headers: { "User-Agent": "hydrovinci-electron" }
        })

        const data = await res.json()
        const addr = data.address || {}
        const place = [addr.city || addr.town || addr.village || addr.hamlet, addr.state, addr.country].filter(Boolean).join(", ")
        cache.set(key, place || key)
        
        return place || key
    } catch {
        return key
    }
}

export async function resolveLocations(missions) {
    for (const m of missions) {
        const coords = parseCoordinates(m.location)
        if (!coords) continue
        
        m.location = await Geocode(coords.lat, coords.lon).catch(() => m.location)
        await new Promise(r => setTimeout(r, 1100)) // Nominatim rate-limit
    }
}