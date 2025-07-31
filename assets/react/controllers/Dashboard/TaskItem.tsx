import * as React from "react";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Badge } from "@material-tailwind/react";

export default function TaskItem({ task, onDelete }) {
    const taskItemRef = React.useRef(null);

    React.useEffect(() => {
        const element = taskItemRef.current;
        if (element) {
            return draggable({
                element: element,
            });
        }
    }, []);

    const handleDelete = (e) => {
        e.preventDefault();
        if (window.confirm('Wirklich löschen?')) {
            // Submit delete form
            const formData = new FormData();
            fetch(`/api/v1/task/delete?id=${task.id}`, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    // Reload the page to reflect changes
                    window.location.reload();
                } else {
                    console.error('Failed to delete task');
                    alert('Failed to delete task');
                }
            })
            .catch(error => {
                console.error('Error deleting task:', error);
                alert('Error deleting task: ' + error.message);
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High':
                return 'bg-red-500';
            case 'Medium':
                return 'bg-yellow-500';
            case 'Low':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div
            ref={taskItemRef}
            className="relative flex flex-col bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm border border-slate-200 rounded-lg w-full task-item"
            data-task-id={task.id}
            data-status={task.status?.name || task.status}
        >
            <div className="mx-3 sm:mx-3 mb-0 border-b border-slate-200 pt-3 sm:pt-3 pb-3 sm:pb-2 px-2 sm:px-1 flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                    <span className="text-lg sm:text-base font-medium text-slate-600 dark:text-white truncate">
                        {task.title}
                    </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-2 flex-shrink-0">
                    {task.priority && (
                        <Badge className={`rounded-full px-3 py-1.5 sm:px-3 sm:py-1 ${getPriorityColor(task.priority)} text-white dark:text-gray-100 text-sm sm:text-xs font-medium`}>
                            {task.priority}
                        </Badge>
                    )}
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="text-gray-400 hover:text-red-600 p-2 sm:p-1 -m-2 sm:-m-1"
                    >
                        <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="p-4 sm:p-4">
                <p className="text-base sm:text-sm text-slate-600 leading-relaxed sm:leading-normal font-light dark:text-white">
                    {task.description || 'Keine Beschreibung'}
                </p>
                {task.dueDate && (
                    <span className="text-red-500 dark:text-red-250 text-sm sm:text-sm block mt-3 sm:mt-2 font-medium">
                        Fällig: {formatDate(task.dueDate)}
                    </span>
                )}
            </div>
            <div className="mx-3 sm:mx-3 border-t border-slate-200 pb-3 sm:pb-3 pt-3 sm:pt-2 px-2 sm:px-1">
                <span className="text-sm sm:text-xs text-slate-600 font-medium dark:text-white">
                    Zuletzt aktualisiert: {formatDateTime(task.updatedAt || task.createdAt)}
                </span>
            </div>
        </div>
    );
}
