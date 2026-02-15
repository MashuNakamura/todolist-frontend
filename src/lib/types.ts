export interface APIResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: number;
}

export interface UserData {
    token: string;
    user: {
        ID: number;
        name: string;
        email: string;
    };
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    name: string;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    email: string;
    otp: string;
    password: string;
}

export interface ChangePasswordPayload {
    old_password: string;
    new_password: string;
}

export interface CreateCategoryPayload {
    name: string;
    color: string;
}

export interface UpdateCategoryPayload {
    ID: number;
    name: string;
    color: string;
}

export interface UserProfile {
    name: string;
    email?: string;
}

export interface Task {
    ID: number;
    title: string;
    short_desc: string;
    long_desc: string;
    priority: string;
    status: string;
    due_date?: string; // ISO 8601 String
    tags: string[];
    user_id: number;
}

export interface Category {
    ID: number;
    name: string;
    color: string;
}