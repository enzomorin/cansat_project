const API_URL = "http://localhost:8000/db/missions"
const API_KEY = "AZE"

export async function fetchAPI(endpoint, method = "GET", notif = true, successMsg = "request done !", errorMsg = "sorry, something went wrong...") {
    try {
        const resp = await fetch(API_URL + endpoint, {
            method,
            headers: { "x-api-key": API_KEY }
        })
        if (!resp.ok) throw new Error(resp.status)
        const result = await resp.json()
        if (notif) {
            if (result.success) window.notif.success(successMsg)
            else window.notif.error(errorMsg)
        }

        return result
    } catch (err) {
        if (notif) window.notif.error(errorMsg)

        return null
    }
}