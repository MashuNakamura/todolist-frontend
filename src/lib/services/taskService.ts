import { client } from "$lib";
import type { APIResponse, Task, CreateTaskPayload, UpdateTaskPayload } from "$lib";

export const taskService = {
    // [POST] /api/tasks
    createTask: async (payload: CreateTaskPayload): Promise<APIResponse<Task>> => {
        const response = await client.post("/tasks", payload);
        return response;
    },

    // [GET] /api/tasks - Frontend Skip This API
    getTasks: async (): Promise<APIResponse<Task[]>> => {
        const response = await client.get(`/tasks`);
        return response;
    },

    // [GET] /api/tasks/:id
    getTaskById: async (id: number): Promise<APIResponse<Task>> => {
        const response = await client.get(`/tasks/${id}`);
        return response;
    },

    // [GET] /api/tasks/user/:id
    getTaskByUserId: async (id: number): Promise<APIResponse<Task[]>> => {
        const response = await client.get(`/tasks/user/${id}`);
        return response;
    },

    // [PUT] /api/tasks/:id
    updateTask: async (id: number, payload: UpdateTaskPayload): Promise<APIResponse<Task>> => {
        const response = await client.put(`/tasks/${id}`, payload);
        return response;
    },

    // [DELETE] /api/tasks/:id
    deleteTask: async (ids: number[]): Promise<APIResponse<Task>> => {
        const response = await client.delete(`/tasks/${ids}`);
        return response;
    },

    // [PUT] /api/tasks/status
    updateBatchStatus: async (ids: number[], status: string): Promise<APIResponse<Task>> => {
        const response = await client.put(`/tasks/status`, { ids, status });
        return response;
    },
}
