const API_CACHE = new Map()

export async function fetchAPI(endpoint, options = {}) {
    const {
        method = "GET",
        body = null,
        showNotif = false,
        successMsg = "",
        errorMsg = "API request failed",
        cache = method === "GET"
    } = options

    const cacheKey = `${method}:${endpoint}`

    // CACHE
    if (cache && API_CACHE.has(cacheKey))
        return API_CACHE.get(cacheKey)

    try {
        const result = await window.api.request({
            endpoint,
            method,
            body
        })

        if (!result)
            throw new Error("No response from API")

        if (!result.success)
            throw new Error(result.error || errorMsg)

        let data = result.data

        // unwrap nested API format
        if (
            data &&
            typeof data === "object" &&
            "success" in data &&
            "data" in data
        ) {

            if (!data.success)
                throw new Error(data.error || errorMsg)

            data = data.data
        }

        // save cache
        if (cache)
            API_CACHE.set(cacheKey, data)

        // invalidate cache on mutation
        if (method !== "GET")
            invalidateCache()

        if (showNotif && successMsg)
            window.notif.success(successMsg)

        return data
    } catch (err) {
        console.error("API ERROR:", err)

        if (showNotif)
            window.notif.error(err.message || errorMsg)

        throw err
    }
}

export function invalidateCache(match = "") {
    if (!match) {
        API_CACHE.clear()
        return
    }

    for (const key of API_CACHE.keys()) {
        if (key.includes(match))
            API_CACHE.delete(key)
    }
}