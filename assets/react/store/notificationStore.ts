import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number; // in milliseconds, 0 means persistent
    dismissible?: boolean;
    createdAt: number;
}

interface NotificationState {
    // State
    notifications: Notification[];

    // Actions
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;

    // Convenience methods
    success: (title: string, message?: string, options?: Partial<Notification>) => void;
    error: (title: string, message?: string, options?: Partial<Notification>) => void;
    warning: (title: string, message?: string, options?: Partial<Notification>) => void;
    info: (title: string, message?: string, options?: Partial<Notification>) => void;
}

const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const defaultDurations = {
    success: 5000,
    info: 5000,
    warning: 7000,
    error: 0, // persistent by default
};

export const useNotificationStore = create<NotificationState>()(
    devtools(
        (set, get) => ({
            notifications: [],

            addNotification: (notification) => {
                const id = generateId();
                const createdAt = Date.now();
                const duration = notification.duration ?? defaultDurations[notification.type];
                const dismissible = notification.dismissible ?? true;

                const newNotification: Notification = {
                    ...notification,
                    id,
                    createdAt,
                    duration,
                    dismissible,
                };

                set((state) => ({
                    notifications: [...state.notifications, newNotification]
                }));

                // Auto-remove notification after duration (if not persistent)
                if (duration > 0) {
                    setTimeout(() => {
                        get().removeNotification(id);
                    }, duration);
                }
            },

            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter(notification => notification.id !== id)
            })),

            clearAll: () => set({ notifications: [] }),

            success: (title, message, options = {}) => {
                get().addNotification({
                    type: 'success',
                    title,
                    message,
                    ...options,
                });
            },

            error: (title, message, options = {}) => {
                get().addNotification({
                    type: 'error',
                    title,
                    message,
                    ...options,
                });
            },

            warning: (title, message, options = {}) => {
                get().addNotification({
                    type: 'warning',
                    title,
                    message,
                    ...options,
                });
            },

            info: (title, message, options = {}) => {
                get().addNotification({
                    type: 'info',
                    title,
                    message,
                    ...options,
                });
            },
        }),
        {
            name: 'notification-store',
        }
    )
);
