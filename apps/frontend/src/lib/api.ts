/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const getAuthToken = () => {
    if (typeof window !== "undefined") {
        try {
            const authStr = localStorage.getItem("auth-storage");
            if (authStr) {
                const parsed = JSON.parse(authStr);
                return parsed.state?.token || "";
            }
        } catch (e) {
            console.error("Error reading token", e);
        }
    }
    return "";
};

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    let data;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    return data;
};

const api = {
    get: (url: string) => apiFetch(url, { method: "GET" }),
    post: (url: string, body?: unknown) => apiFetch(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
    put: (url: string, body?: unknown) => apiFetch(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
    delete: (url: string) => apiFetch(url, { method: "DELETE" }),
};

export default api;
