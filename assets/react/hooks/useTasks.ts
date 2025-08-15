import { useCallback } from 'react';
import { useTaskStore, Task, TasksByStatus } from '../store/taskStore';
import { apiService, ApiService, CreateTaskRequest, UpdateTaskRequest, UpdateTaskStatusRequest } from '../services/apiService';

// Helper function to show notifications
const showNotification = {
    success: (title: string, message?: string) => {
        if (typeof window !== 'undefined' && window.notifications) {
            window.notifications.success(title, message);
        }
    },
    error: (title: string, message?: string) => {
        if (typeof window !== 'undefined' && window.notifications) {
            window.notifications.error(title, message);
        }
    },
    warning: (title: string, message?: string) => {
        if (typeof window !== 'undefined' && window.notifications) {
            window.notifications.warning(title, message);
        }
    },
    info: (title: string, message?: string) => {
        if (typeof window !== 'undefined' && window.notifications) {
            window.notifications.info(title, message);
        }
    }
};

export const useTasks = () => {
    const {
        tasks,
        tasksByStatus,
        isLoading,
        error,
        setTasks,
        setTasksByStatus,
        setLoading,
        setError,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        clearError,
        reset
    } = useTaskStore();

    // Fetch all tasks grouped by status
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.getTasks();
            if (response.data) {
                const parsedData: TasksByStatus = JSON.parse(response.data);
                setTasksByStatus(parsedData);

                // Also flatten tasks for the tasks array
                const allTasks: Task[] = [];
                Object.values(parsedData).forEach(statusTasks => {
                    allTasks.push(...statusTasks);
                });
                setTasks(allTasks);
            }
        } catch (error) {
            const errorMessage = ApiService.handleApiError(error);
            setError(errorMessage);
            showNotification.error('Failed to fetch tasks', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, setTasksByStatus, setTasks]);

    // Create a new task
    const createTask = useCallback(async (taskData: CreateTaskRequest): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.createTask(taskData);

            // Refresh tasks after creation
            await fetchTasks();

            showNotification.success('Task created successfully', `"${taskData.title}" has been added to your tasks`);
            return true;
        } catch (error) {
            const errorMessage = ApiService.handleApiError(error);
            setError(errorMessage);
            showNotification.error('Failed to create task', errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, fetchTasks]);

    // Update an existing task
    const updateTaskData = useCallback(async (taskData: UpdateTaskRequest): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await apiService.updateTask(taskData);

            // Update local state
            updateTask(taskData.id, {
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority,
                due_date: taskData.due_date,
            });

            showNotification.success('Task updated successfully', `"${taskData.title}" has been updated`);
            return true;
        } catch (error) {
            const errorMessage = ApiService.handleApiError(error);
            setError(errorMessage);
            showNotification.error('Failed to update task', errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, updateTask]);

    // Update task status (for drag and drop)
    const updateTaskStatus = useCallback(async (taskId: number, newStatus: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await apiService.updateTaskStatus({ id: taskId, status: newStatus });

            // Update local state
            moveTask(taskId, newStatus);

            showNotification.success('Task status updated', `Task moved to ${newStatus}`);
            return true;
        } catch (error) {
            const errorMessage = ApiService.handleApiError(error);
            setError(errorMessage);
            showNotification.error('Failed to update task status', errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, moveTask]);

    // Delete a task
    const removeTask = useCallback(async (taskId: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await apiService.deleteTask(taskId);

            // Update local state
            deleteTask(taskId);

            showNotification.success('Task deleted successfully', 'The task has been removed from your list');
            return true;
        } catch (error) {
            const errorMessage = ApiService.handleApiError(error);
            setError(errorMessage);
            showNotification.error('Failed to delete task', errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, deleteTask]);

    // Optimistic update for task status (for better UX during drag and drop)
    const optimisticUpdateTaskStatus = useCallback(async (taskId: number, newStatus: string) => {
        // Update UI immediately
        moveTask(taskId, newStatus);

        try {
            await apiService.updateTaskStatus({ id: taskId, status: newStatus });
        } catch (error) {
            // Revert the optimistic update by refetching
            await fetchTasks();
            const errorMessage = ApiService.handleApiError(error);
            setError(errorMessage);
            showNotification.error('Failed to update task status', errorMessage);
        }
    }, [moveTask, fetchTasks, setError]);

    return {
        // State
        tasks,
        tasksByStatus,
        isLoading,
        error,

        // Actions
        fetchTasks,
        createTask,
        updateTask: updateTaskData,
        updateTaskStatus,
        removeTask,
        optimisticUpdateTaskStatus,
        clearError,
        reset,
    };
};
