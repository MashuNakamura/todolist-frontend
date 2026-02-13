export interface APIResponse<T> {
    success: boolean;
    message: string;
    data: T;
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