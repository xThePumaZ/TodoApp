import * as React from "react";
import TaskColumn from "./TaskColumn";
import { useTasks } from "../../hooks/useTasks";

interface TaskBoardProps {
    csfr_token: string;
}

export default function TaskBoard({ csfr_token }: TaskBoardProps) {
    const { tasksByStatus, isLoading, error, fetchTasks } = useTasks();

    React.useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    if (isLoading) {
        return <div className="flex justify-center items-center p-8">Loading tasks...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center p-8 text-red-600">Error: {error}</div>;
    }

    if (!tasksByStatus) {
        return <div className="flex justify-center items-center p-8">No tasks found.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Object.entries(tasksByStatus).map(([status, tasks]) => (
                <TaskColumn
                    key={status}
                    status={status}
                    tasks={tasks}
                    csfr_token={csfr_token}
                />
            ))}
        </div>
    );
}
