// API Response types
export interface ApiResponse<T = any> {
    message: string;
    data: T;
}

export class ApiError extends Error {
    public status: number;

    constructor(options: { message: string; status: number }) {
        super(options.message);
        this.status = options.status;
        this.name = 'ApiError';
    }
}

export interface CreateTaskRequest {
    title: string;
    description?: string;
    priority: string;
    due_date?: string;
    _token?: string;
}

export interface UpdateTaskRequest {
    id: number;
    title?: string;
    description?: string;
    priority?: string;
    due_date?: string;
    _token?: string;
}

export interface UpdateTaskStatusRequest {
    id: number;
    status: string;
}

export interface ProfilePictureResponse {
    image: string;
}

export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    _token?: string;
}

class ApiService {
    private baseUrl: string = '/api/v1';

    // Generic HTTP request method
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Don't set Content-Type for FormData - let browser set it with boundary
        if (options.body instanceof FormData) {
            delete (config.headers as any)['Content-Type'];
        }

        try {
            const response = await fetch(url, config);
            let data: any;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new ApiError({
                    message: data.message || `HTTP error! status: ${response.status}`,
                    status: response.status,
                });
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError({
                message: error instanceof Error ? error.message : 'An unknown error occurred',
                status: 0,
            });
        }
    }

    private async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    private async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    private async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    private async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    private async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    async getTasks(): Promise<ApiResponse<string>> {
        return this.get<ApiResponse<string>>('/task/getTasksWithStatus');
    }

    async createTask(taskData: CreateTaskRequest): Promise<ApiResponse> {
        return this.post<ApiResponse>('/task', taskData);
    }

    async updateTask(taskData: UpdateTaskRequest): Promise<ApiResponse> {
        return this.put<ApiResponse>(`/task/${taskData.id}`, taskData);
    }

    async updateTaskStatus(statusData: UpdateTaskStatusRequest): Promise<ApiResponse> {
        return this.patch<ApiResponse>('/task/updateStatus', statusData);
    }

    async deleteTask(taskId: number): Promise<ApiResponse> {
        return this.delete<ApiResponse>(`/task/${taskId}`);
    }

    async getCurrentUser(): Promise<ApiResponse> {
        return this.get<ApiResponse>('/user/current');
    }

    async loadProfilePicture(): Promise<ApiResponse<ProfilePictureResponse>> {
        return this.get<ApiResponse<ProfilePictureResponse>>('/user/picture/load');
    }

    async changeProfilePicture(imageFile: File): Promise<ApiResponse> {
        const formData = new FormData();
        formData.append('profileImage', imageFile);

        return this.request<ApiResponse>('/user/picture/change', {
            method: 'POST',
            body: formData,
        });
    }

    async changePassword(passwordData: PasswordChangeRequest): Promise<ApiResponse> {
        return this.patch<ApiResponse>('/user/password/change', passwordData);
    }

    static handleApiError(error: unknown): string {
        if (error instanceof ApiError) {
            return error.message;
        }

        if (error instanceof Error) {
            return error.message;
        }

        return 'An unknown error occurred';
    }
}

export const apiService = new ApiService();

export { ApiService };
