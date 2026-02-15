import { client } from "$lib/api";
import type { APIResponse, UserData, LoginPayload, RegisterPayload, ForgotPasswordPayload, ResetPasswordPayload, ChangePasswordPayload, UserProfile } from '@/types';

export const authService = {
    // Already used on Auth Page
    login: async (payload: LoginPayload): Promise<APIResponse<UserData>> => {
        return await client.post('/login', payload);
    },
    // Already used on Auth Page
    register: async (payload: RegisterPayload): Promise<APIResponse<UserData>> => {
        return await client.post("/register", payload);
    },
    // Already used on Auth Page
    forgotPassword: async (payload: ForgotPasswordPayload): Promise<APIResponse<UserData>> => {
        return await client.post("/forgot-password", payload);
    },
    // Already used on Auth Page
    resetPassword: async (payload: ResetPasswordPayload): Promise<APIResponse<UserData>> => {
        return await client.post("/reset-password", payload);
    },
    // Already used on Settings Page
    changePassword: async (payload: ChangePasswordPayload): Promise<APIResponse<UserData>> => {
        return await client.post("/change-password", payload);
    },
    // Already used on Dashboard Page, Landing Page, Settings Page, and Sidebar
    GetUserProfile: async (): Promise<APIResponse<UserProfile>> => {
        return await client.get("/profile");
    },
    // Already used on Settings Page
    UpdateUserProfile: async (payload: UserProfile): Promise<APIResponse<UserProfile>> => {
        return await client.post("/update-profile", payload);
    },
    // Already used on Sidebar and Settings Page
    Logout: () => {
        localStorage.removeItem("token");
    },
    // Di dalam object authService
    googleLogin: async (): Promise<{ url: string }> => {
        return await client.get("/auth/google/login");
    },
}