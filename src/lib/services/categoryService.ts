import { client } from "$lib";
import type { APIResponse, CreateCategoryPayload, Category, UpdateCategoryPayload } from "$lib";

export const categoryService = {
    createCategory: async (payload: CreateCategoryPayload): Promise<APIResponse<Category>> => {
        const response = await client.post("/categories", payload);
        return response;
    },

    getCategories: async (): Promise<APIResponse<Category[]>> => {
        const response = await client.get(`/categories`);
        return response;
    },

    updateCategory: async (id: number, payload: UpdateCategoryPayload): Promise<APIResponse<Category>> => {
        const response = await client.put(`/categories/${id}`, payload);
        return response;
    },

    deleteCategory: async (id: number): Promise<APIResponse<Category>> => {
        const response = await client.delete(`/categories/${id}`);
        return response;
    },
}