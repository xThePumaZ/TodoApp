import * as React from "react";
import TaskItem from "./TaskItem";
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

export default function TaskColumn({ status, tasks, csfr_token }) {
    const columnRef = React.useRef(null);
    const [isDragOver, setIsDragOver] = React.useState(false);

    React.useEffect(() => {
        const element = columnRef.current;
        if (element) {
            return dropTargetForElements({
                element: element,
                onDragEnter() {
                    setIsDragOver(true);
                },
                onDragLeave() {
                    setIsDragOver(false);
                },
                onDrop({source}) {
                    setIsDragOver(false);
                    const sourceData = source.data;
                    const sourceStatus = sourceData.status || source.element.getAttribute('data-status');
                    const taskId = sourceData.taskId || source.element.getAttribute('data-task-id');

                    if (status !== sourceStatus) {
                        fetch(`/api/v1/task/updateStatus`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                id: taskId,
                                status: status,
                            }),
                        }).then(r => {
                            if (r.status === 200) {
                                // Reload the page to reflect changes
                                window.location.reload();
                            } else {
                                throw new Error('Network response was not ok');
                            }
                        }).catch(error => {
                            console.error('Error updating task status:', error);
                            alert('Error updating task status: ' + error.message);
                        });
                    }
                },
            });
        }
    }, [status]);

    // Mobile touch event handlers for visual feedback
    React.useEffect(() => {
        const element = columnRef.current;
        if (!element) return;

        const handleTouchMove = (e) => {
            // Check if there's an active drag operation
            const draggedElement = document.querySelector('.task-item[style*="opacity: 0.7"]');
            if (draggedElement) {
                const touch = e.touches[0];
                const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                const targetColumn = elementBelow?.closest('.task-list')?.closest('[data-status]');

                if (targetColumn === element) {
                    setIsDragOver(true);
                } else {
                    setIsDragOver(false);
                }
            }
        };

        const handleTouchEnd = () => {
            setIsDragOver(false);
        };

        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    const capitalizeFirst = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    return (
        <div
            ref={columnRef}
            className={`bg-white dark:bg-gray-500 rounded shadow p-4 sm:p-6 task-list mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200 ${
                isDragOver ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600 border-2 border-dashed' : ''
            }`}
            data-status={status}
        >
            <h2 className="text-xl sm:text-lg font-bold mb-4 sm:mb-4 text-gray-800 dark:text-white">
                {capitalizeFirst(status)}
            </h2>
            <div id={`task-list-${status}`} className="space-y-4 sm:space-y-4">
                {tasks && tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            csfr_token={csfr_token}
                        />
                    ))
                ) : (
                    <div className="text-gray-500 dark:text-gray-300 text-base sm:text-sm italic text-center py-8 sm:py-4">
                        No tasks in this status
                    </div>
                )}
            </div>
        </div>
    );
}
