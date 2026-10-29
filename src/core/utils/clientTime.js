/** Device clock sent to the API for creates, updates, and monitor history. */

/** Local device wall clock (no UTC / timezone conversion on the server). */
export function clientTimeIso() {
	const d = new Date()
	const pad = (n) => String(n).padStart(2, '0')
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function clientLocalDateYmd(date = new Date()) {
	const d = date instanceof Date ? date : new Date(date)
	const pad = (n) => String(n).padStart(2, '0')
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Merge client_time into JSON bodies (axios also sets X-Client-Time / X-Client-Local-Date). */
export function withClientTime(payload) {
	if (payload == null) {
		return { client_time: clientTimeIso() }
	}
	if (typeof payload === 'object' && !Array.isArray(payload)) {
		return { ...payload, client_time: clientTimeIso() }
	}
	return payload
}
