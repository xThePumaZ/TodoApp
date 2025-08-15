import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types
export interface Task {
    id: number;
    title: string;
    description?: string;
    priority: string;
    due_date?: string;
    dueDate?: string;
    status: {
        name: string;
    } | string;
    updatedAt?: string;
    createdAt?: string;
}

export interface TasksByStatus {
    [status: string]: Task[];
}

interface TaskState {
    // State
    tasks: Task[];
    tasksByStatus: TasksByStatus | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setTasks: (tasks: Task[]) => void;
    setTasksByStatus: (tasksByStatus: TasksByStatus) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    addTask: (task: Task) => void;
    updateTask: (taskId: number, updates: Partial<Task>) => void;
    deleteTask: (taskId: number) => void;
    moveTask: (taskId: number, newStatus: string) => void;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    tasks: [],
    tasksByStatus: null,
    isLoading: false,
    error: null,
};

export const useTaskStore = create<TaskState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setTasks: (tasks) => set({ tasks }),

            setTasksByStatus: (tasksByStatus) => set({ tasksByStatus }),

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error }),

            addTask: (task) => set((state) => {
                const newTasks = [...state.tasks, task];
                const statusKey = typeof task.status === 'object' ? task.status.name : task.status;

                let newTasksByStatus = state.tasksByStatus;
                if (newTasksByStatus) {
                    newTasksByStatus = {
                        ...newTasksByStatus,
                        [statusKey]: [...(newTasksByStatus[statusKey] || []), task]
                    };
                }

                return {
                    tasks: newTasks,
                    tasksByStatus: newTasksByStatus
                };
            }),

            updateTask: (taskId, updates) => set((state) => {
                const newTasks = state.tasks.map(task =>
                    task.id === taskId ? { ...task, ...updates } : task
                );

                let newTasksByStatus = state.tasksByStatus;
                if (newTasksByStatus) {
                    // Update task in tasksByStatus
                    Object.keys(newTasksByStatus).forEach(status => {
                        newTasksByStatus![status] = newTasksByStatus![status].map(task =>
                            task.id === taskId ? { ...task, ...updates } : task
                        );
                    });
                }

                return {
                    tasks: newTasks,
                    tasksByStatus: newTasksByStatus
                };
            }),

            deleteTask: (taskId) => set((state) => {
                const newTasks = state.tasks.filter(task => task.id !== taskId);

                let newTasksByStatus = state.tasksByStatus;
                if (newTasksByStatus) {
                    Object.keys(newTasksByStatus).forEach(status => {
                        newTasksByStatus![status] = newTasksByStatus![status].filter(task => task.id !== taskId);
                    });
                }

                return {
                    tasks: newTasks,
                    tasksByStatus: newTasksByStatus
                };
            }),

            moveTask: (taskId, newStatus) => set((state) => {
                if (!state.tasksByStatus) return state;

                let taskToMove: Task | null = null;
                let oldStatus: string | null = null;

                // Find the task and its current status
                Object.entries(state.tasksByStatus).forEach(([status, tasks]) => {
                    const foundTask = tasks.find(task => task.id === taskId);
                    if (foundTask) {
                        taskToMove = foundTask;
                        oldStatus = status;
                    }
                });

                if (!taskToMove || !oldStatus || oldStatus === newStatus) {
                    return state;
                }

                // Update task status
                const updatedTask = {
                    ...taskToMove,
                    status: typeof taskToMove.status === 'object'
                        ? { name: newStatus }
                        : newStatus
                };

                // Create new tasksByStatus
                const newTasksByStatus = {
                    ...state.tasksByStatus,
                    [oldStatus]: state.tasksByStatus[oldStatus].filter(task => task.id !== taskId),
                    [newStatus]: [...(state.tasksByStatus[newStatus] || []), updatedTask]
                };

                // Update tasks array
                const newTasks = state.tasks.map(task =>
                    task.id === taskId ? updatedTask : task
                );

                return {
                    tasks: newTasks,
                    tasksByStatus: newTasksByStatus
                };
            }),

            clearError: () => set({ error: null }),

            reset: () => set(initialState),
        }),
        {
            name: 'task-store',
        }
    )
);
