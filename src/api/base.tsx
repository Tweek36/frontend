export const API_URL = "http://127.0.0.1:8000";

export const unauthenticatedFetch = async (input: string | Request | URL, init?: RequestInit, isJSON: boolean = true): Promise<Response> => {
    if (isJSON && init && init.body instanceof FormData) {
        init.body = JSON.stringify(Object.fromEntries(init.body.entries()));
        init.headers = {
            ...init.headers,
            'Content-Type': 'application/json',
        }
    }
    if (typeof input === 'string') {
        input = `${API_URL}${input}`;
    }
    const request = new Request(input, init)
    const response = await fetch(request)
    return response
}