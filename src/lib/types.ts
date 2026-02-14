export interface APIResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: number;
}

export interface UserData {
    token: string;
    user: {
        id: number;
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

export interface UserProfile {
    name: string;
}

export interface Task {
    ID: number;
    title: string;
    short_desc: string;
    long_desc: string;
    priority: string;
    status: string;
    time: string;
    date: string;
    tags: string[];
    user_id: number;
}

export interface Category {
    ID: number;
    name: string;
    color: string;
}