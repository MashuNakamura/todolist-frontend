import { PUBLIC_API_URL } from '$env/static/public';

const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

export const client = {
    post: async (path: string, body: any) => {
        const res = await fetch(`${PUBLIC_API_URL}${path}`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        return res.json();
    },

    get: async (path: string) => {
        const res = await fetch(`${PUBLIC_API_URL}${path}`, {
            headers: getHeaders(),
        });
        return res.json();
    },

    put: async (path: string, body: any) => {
        const res = await fetch(`${PUBLIC_API_URL}${path}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        return res.json();
    },

    delete: async (path: string, body?: any) => {
        const res = await fetch(`${PUBLIC_API_URL}${path}`, {
            method: "DELETE",
            headers: getHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });
        return res.json();
    }
};