import React from 'react';
import { useNotificationStore } from '../store/notificationStore';
import NotificationAlert from './NotificationAlert';

const NotificationContainer: React.FC = () => {
    const { notifications } = useNotificationStore();

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-3 pointer-events-none">
            {notifications.map((notification) => (
                <div key={notification.id} className="pointer-events-auto">
                    <NotificationAlert
                        notification={notification}
                    />
                </div>
            ))}
        </div>
    );
};

export default NotificationContainer;
