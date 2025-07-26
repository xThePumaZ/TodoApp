import * as React from "react";

export default function TaskItem({ task, onDelete }) {
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

    return (
        <div
            className="relative flex flex-col bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm border border-slate-200 rounded-lg w-full task-item"
            data-task-id={task.id}
            data-status={task.status?.name || task.status}
        >
            <div className="mx-2 sm:mx-3 mb-0 border-b border-slate-200 pt-2 sm:pt-3 pb-2 px-1 flex items-center justify-between">
                <span className="text-base font-medium text-slate-600 dark:text-white truncate mr-2">
                    {task.title}
                </span>
                <button
                    type="button"
                    onClick={handleDelete}
                    className="ml-2 text-gray-400 hover:text-red-600 flex-shrink-0"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                </button>
            </div>
            <div className="p-3 sm:p-4">
                <p className="text-sm text-slate-600 leading-normal font-light dark:text-white">
                    {task.description || 'Keine Beschreibung'}
                </p>
                {task.dueDate && (
                    <span className="text-red-500 dark:text-red-250 text-xs sm:text-sm block mt-2">
                        Fällig: {formatDate(task.dueDate)}
                    </span>
                )}
            </div>
            <div className="mx-2 sm:mx-3 border-t border-slate-200 pb-2 sm:pb-3 pt-2 px-1">
                <span className="text-xs sm:text-sm text-slate-600 font-medium dark:text-white">
                    Zuletzt aktualisiert: {formatDateTime(task.updatedAt || task.createdAt)}
                </span>
            </div>
        </div>
    );
}
