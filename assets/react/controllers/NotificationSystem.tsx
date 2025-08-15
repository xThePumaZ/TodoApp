import React from 'react';
import { createRoot } from 'react-dom/client';
import { Controller } from '@hotwired/stimulus';
import NotificationContainer from '../components/NotificationContainer';
import { useNotificationStore } from '../store/notificationStore';

// Global notification interface for easy access from anywhere in the app
declare global {
    interface Window {
        notifications: {
            success: (title: string, message?: string) => void;
            error: (title: string, message?: string) => void;
            warning: (title: string, message?: string) => void;
            info: (title: string, message?: string) => void;
            clear: () => void;
        };
    }
}

export default class extends Controller {
    private root: any;

    connect() {
        // Create React root and render the notification container
        this.root = createRoot(this.element);
        this.root.render(<NotificationContainer />);

        // Expose notification methods globally
        this.setupGlobalNotifications();
    }

    disconnect() {
        if (this.root) {
            this.root.unmount();
        }

        // Clean up global notifications
        if (window.notifications) {
            delete window.notifications;
        }
    }

    private setupGlobalNotifications() {
        const store = useNotificationStore.getState();

        window.notifications = {
            success: (title: string, message?: string) => {
                store.success(title, message);
            },
            error: (title: string, message?: string) => {
                store.error(title, message);
            },
            warning: (title: string, message?: string) => {
                store.warning(title, message);
            },
            info: (title: string, message?: string) => {
                store.info(title, message);
            },
            clear: () => {
                store.clearAll();
            }
        };
    }

    // Stimulus action methods for triggering notifications from HTML
    success(event: Event) {
        const target = event.target as HTMLElement;
        const title = target.dataset.title || 'Success';
        const message = target.dataset.message;
        window.notifications.success(title, message);
    }

    error(event: Event) {
        const target = event.target as HTMLElement;
        const title = target.dataset.title || 'Error';
        const message = target.dataset.message;
        window.notifications.error(title, message);
    }

    warning(event: Event) {
        const target = event.target as HTMLElement;
        const title = target.dataset.title || 'Warning';
        const message = target.dataset.message;
        window.notifications.warning(title, message);
    }

    info(event: Event) {
        const target = event.target as HTMLElement;
        const title = target.dataset.title || 'Info';
        const message = target.dataset.message;
        window.notifications.info(title, message);
    }
}
