import { client } from "$lib/api";
import type { APIResponse, UserData, LoginPayload, RegisterPayload, ForgotPasswordPayload, ResetPasswordPayload, ChangePasswordPayload } from '@/types';

export const authService = {
    login: async (payload: LoginPayload): Promise<APIResponse<UserData>> => {
        return await client.post('/login', payload);
    },
    register: async (payload: RegisterPayload): Promise<APIResponse<UserData>> => {
        return await client.post("/register", payload);
    },
    forgotPassword: async (payload: ForgotPasswordPayload): Promise<APIResponse<UserData>> => {
        return await client.post("/forgot-password", payload);
    },
    resetPassword: async (payload: ResetPasswordPayload): Promise<APIResponse<UserData>> => {
        return await client.post("/reset-password", payload);
    },
    changePassword: async (payload: ChangePasswordPayload): Promise<APIResponse<UserData>> => {
        return await client.post("/change-password", payload);
    },
}