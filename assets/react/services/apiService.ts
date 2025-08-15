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

// Task-related types
export interface CreateTaskRequest {
    title: string;
    description?: string;
    priority: string;
    due_date?: string;
}

export interface UpdateTaskRequest {
    task_id: number;
    title?: string;
    description?: string;
    priority?: string;
    due_date?: string;
}

export interface UpdateTaskStatusRequest {
    task_id: number;
    status: string;
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

        try {
            const response = await fetch(url, config);

            // Handle different response types
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

            // Network or other errors
            throw new ApiError({
                message: error instanceof Error ? error.message : 'An unknown error occurred',
                status: 0,
            });
        }
    }

    // GET request
    private async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    // POST request
    private async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // DELETE request
    private async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    // Task API methods
    async getTasks(): Promise<ApiResponse<string>> {
        return this.get<ApiResponse<string>>('/task/getTasksWithStatus');
    }

    async createTask(taskData: CreateTaskRequest): Promise<ApiResponse> {
        return this.post<ApiResponse>('/task/addTask', taskData);
    }

    async updateTask(taskData: UpdateTaskRequest): Promise<ApiResponse> {
        return this.post<ApiResponse>('/task/editTask', taskData);
    }

    async updateTaskStatus(statusData: UpdateTaskStatusRequest): Promise<ApiResponse> {
        return this.post<ApiResponse>('/task/updateStatus', statusData);
    }

    async deleteTask(taskId: number): Promise<ApiResponse> {
        return this.post<ApiResponse>(`/task/delete?id=${taskId}`);
    }

    // User API methods (if needed)
    async getCurrentUser(): Promise<ApiResponse> {
        return this.get<ApiResponse>('/user/current');
    }

    // Utility method to handle API errors consistently
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

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the ApiService class for static methods
export { ApiService };
