function getCookies(req, key) {
    if (!key) {  
        const cookies = Object.entries(req.cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ");

        return cookies
    } else {
        return req.cookies[key]
    }
}

module.exports = getCookies