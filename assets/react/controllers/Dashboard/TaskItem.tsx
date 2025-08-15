import * as React from "react";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Badge } from "@material-tailwind/react";
import { useTasks } from "../../hooks/useTasks";
import EditTaskModal from "./EditTaskModal";

interface Task {
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

interface TaskItemProps {
    task: Task;
    csfr_token: string;
    onTaskUpdate?: () => void;
    onTaskDelete?: () => void;
}

export default function TaskItem({ task, csfr_token, onTaskUpdate, onTaskDelete }: TaskItemProps) {
    const { optimisticUpdateTaskStatus, removeTask, updateTask } = useTasks();
    const taskItemRef = React.useRef(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const [touchStartPos, setTouchStartPos] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
        const element = taskItemRef.current;
        if (element) {
            return draggable({
                element: element,
                getInitialData: () => ({
                    taskId: task.id,
                    status: typeof task.status === 'object' ? task.status.name : task.status
                }),
            });
        }
    }, [task.id, task.status]);

    // Mobile touch event handlers
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0];
        setTouchStartPos({ x: touch.clientX, y: touch.clientY });
        setIsDragging(false);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!taskItemRef.current) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.y);

        // Start dragging if moved more than 10px
        if ((deltaX > 10 || deltaY > 10) && !isDragging) {
            setIsDragging(true);
            e.preventDefault();

            // Add visual feedback
            const element = taskItemRef.current as HTMLElement;
            element.style.opacity = '0.7';
            element.style.transform = 'scale(1.05)';
            element.style.zIndex = '1000';
            element.style.position = 'relative';
        }

        if (isDragging) {
            e.preventDefault();
        }
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging || !taskItemRef.current) {
            setIsDragging(false);
            return;
        }

        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetColumn = elementBelow?.closest('.task-list')?.closest('[data-status]');

        // Reset visual styles
        taskItemRef.current.style.opacity = '';
        taskItemRef.current.style.transform = '';
        taskItemRef.current.style.zIndex = '';
        taskItemRef.current.style.position = '';

        if (targetColumn) {
            const newStatus = targetColumn.getAttribute('data-status');
            const currentStatus = typeof task.status === 'object' ? task.status.name : task.status;

            if (newStatus && newStatus !== currentStatus) {
                // Update task status via optimistic update
                optimisticUpdateTaskStatus(task.id, newStatus);
                // Call the callback to update the parent component
                onTaskUpdate?.();
            }
        }

        setIsDragging(false);
    };

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to delete this task?')) {
            const success = await removeTask(task.id);
            if (success) {
                // Call the callback to update the parent component
                onTaskDelete?.();
            }
        }
    };

    const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsEditModalOpen(true);
    };

    const handleEditSave = async (taskData: { id: string; title: string; description: string; due_date: string; priority: string; csfr_token: string}) => {
        const updateData = {
            task_id: parseInt(taskData.id),
            title: taskData.title,
            description: taskData.description || '',
            due_date: taskData.due_date || undefined,
            priority: taskData.priority || '',
        };

        const success = await updateTask(updateData);
        if (success) {
            setIsEditModalOpen(false);
            // Call the callback to update the parent component
            onTaskUpdate?.();
        }
    };

    const handleEditClose = () => {
        setIsEditModalOpen(false);
    };

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };

    const formatDateTime = (dateString: string | null | undefined): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityColor = (priority: string): string => {
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
            data-status={typeof task.status === 'object' ? task.status.name : task.status}
            style={{ touchAction: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
                        onClick={handleEdit}
                        className="text-gray-400 hover:text-blue-600 p-2 sm:p-1 -m-2 sm:-m-1"
                    >
                        <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                        </svg>
                    </button>
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

            <EditTaskModal
                task={task}
                isOpen={isEditModalOpen}
                onClose={handleEditClose}
                onSave={handleEditSave}
                priorities={{ "Low": "Low", "Medium": "Medium", "High": "High" }}
                csfr_token={csfr_token}
            />
        </div>
    );
}
