import * as React from "react";
import TaskItem from "./TaskItem";

export default function TaskColumn({ status, tasks }) {
    const capitalizeFirst = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    return (
        <div
            className="bg-white dark:bg-gray-500 rounded shadow p-4 sm:p-6 task-list mb-6 border border-gray-200 dark:border-gray-700"
            data-status={status}
        >
            <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
                {capitalizeFirst(status)}
            </h2>
            <div id={`task-list-${status}`} className="space-y-3 sm:space-y-4">
                {tasks && tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onDelete={() => {
                                // Handle delete action if needed
                            }}
                        />
                    ))
                ) : (
                    <div className="text-gray-500 dark:text-gray-300 text-sm italic">
                        No tasks in this status
                    </div>
                )}
            </div>
        </div>
    );
}
