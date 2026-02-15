import type { Task, APIResponse, Category } from "./types";

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

// CLEAN

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return 0;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user_id;
    } catch (e) {
        return 0;
    }
}

export const api = {
    // --- TASK API ---
    createTask: async (task: Partial<Task>) => {
        const payload = {
            title: task.title,
            short_desc: task.short_desc,
            long_desc: task.long_desc,
            priority: task.priority,
            due_date: task.due_date,
            tags: task.tags,
            status: task.status
        }

        const response = await fetch(`${PUBLIC_API_URL}/tasks`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return await response.json();
    },

    getTasks: async () => {
        const userId = getUserIdFromToken();
        const response = await fetch(`${PUBLIC_API_URL}/tasks/user/${userId}`, {
            headers: getAuthHeaders(),
        });
        const json: APIResponse<Task[]> = await response.json();
        return json.data || [];
    },

    getTaskById: async (id: number) => {
        const response = await fetch(`${PUBLIC_API_URL}/tasks/${id}`, {
            headers: getAuthHeaders(),
        });
        return await response.json();
    },

    updateTask: async (id: number, task: any) => {
        const payload = {
            title: task.title,
            short_desc: task.short_desc,
            long_desc: task.long_desc,
            priority: task.priority,
            status: task.status,
            time: task.time,
            date: task.date,
            tags: task.tags
        }

        const response = await fetch(`${PUBLIC_API_URL}/tasks/${task.ID}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return await response.json();
    },

    deleteTask: async (ids: number[]) => {
        const response = await fetch(`${PUBLIC_API_URL}/tasks`, {
            method: "DELETE",
            headers: getAuthHeaders(),
            body: JSON.stringify({ ids })
        });
        return await response.json();
    },

    updateStatus: async (ids: number[], status: string) => {
        const res = await fetch(`${PUBLIC_API_URL}/tasks/status`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ ids, status })
        });
        return await res.json();
    },
}