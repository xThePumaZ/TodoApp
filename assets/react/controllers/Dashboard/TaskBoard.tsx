import * as React from "react";
import TaskColumn from "./TaskColumn";

export default function TaskBoard(props) {
    const { tasksByStatus } = props;

    console.log(props)

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tasksByStatus && Object.entries(tasksByStatus).map(([status, tasks]) => (
                <TaskColumn
                    key={status}
                    status={status}
                    tasks={tasks}
                />
            ))}
        </div>
    );
}
