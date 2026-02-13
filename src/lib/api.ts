import type { Task, APIResponse, Category } from "./types";

const API_URL = "http://localhost:8080/api";

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
    // --- AUTH API ---
    login: async (email: string, password: string) => {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ email, password }),
        });
        return await response.json();
    },

    register: async (name: string, email: string, password: string) => {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, email, password }),
        });
        return await response.json();
    },

    forgotPassword: async (email: string) => {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ email }),
        });
        return await response.json();
    },

    resetPassword: async (email: string, otp: string, password: string) => {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, otp, password }),
        });
        return await response.json();
    },

    changePassword: async (old_password: string, new_password: string) => {
        const response = await fetch(`${API_URL}/change-password`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ old_password, new_password }),
        });
        return await response.json();
    },

    // --- TASK API ---
    createTask: async (task: Partial<Task>) => {
        const payload = {
            title: task.title,
            short_desc: task.short_desc,
            long_desc: task.long_desc,
            priority: task.priority,
            time: task.time,
            tags: task.tags,
            status: task.status
        }

        const response = await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return await response.json();
    },

    getTasks: async () => {
        const userId = getUserIdFromToken();
        const response = await fetch(`${API_URL}/tasks/user/${userId}`, {
            headers: getAuthHeaders(),
        });
        const json: APIResponse<Task[]> = await response.json();
        return json.data || [];
    },

    getTaskById: async (id: number) => {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            headers: getAuthHeaders(),
        });
        return await response.json();
    },

    updateTask: async (task: Task) => {
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

        const response = await fetch(`${API_URL}/tasks/${task.ID}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return await response.json();
    },

    deleteTask: async (ids: number[]) => {
        const response = await fetch(`${API_URL}/tasks`, {
            method: "DELETE",
            headers: getAuthHeaders(),
            body: JSON.stringify({ ids })
        });
        return await response.json();
    },

    updateStatus: async (ids: number[], status: string) => {
        const res = await fetch(`${API_URL}/tasks/status`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ ids, status })
        });
        return await res.json();
    },

    // Category API
    createCategory: async (name: string, color: string) => {
        const response = await fetch(`${API_URL}/categories`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, color }),
        });
        return await response.json();
    },

    getCategories: async () => {
        const userId = getUserIdFromToken();
        const response = await fetch(`${API_URL}/categories/user/${userId}`, {
            headers: getAuthHeaders(),
        });
        const json: APIResponse<Category[]> = await response.json();
        return json.data || [];
    },

    updateCategory: async (id: number, name: string, color: string) => {
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, color }),
        });
        return await response.json();
    },

    deleteCategory: async (id: number) => {
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        return await response.json();
    },
}