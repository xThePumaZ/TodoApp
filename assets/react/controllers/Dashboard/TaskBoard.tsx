import * as React from "react";
import TaskColumn from "./TaskColumn";

function loadTasksWithStatus() {
    const [tasksByStatus, setTasksByStatus] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(true);
        fetch('/api/v1/task/getTasksWithStatus', {
            method: 'GET'
        })
            .then(async response => {
                if (response.status !== 200) {
                    const data = await response.json();
                    console.error("Failed to get tasks status: ", data.message);
                    throw new Error(data.message || 'Failed to get profile image');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                if (data.data) {
                    setTasksByStatus(JSON.parse(data.data));
                }
                setIsLoading(false);
            })
    }, []);

    return { tasksByStatus, isLoading };
}

function loadTasks() {
    const [tasks, setTasks] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(true);
        fetch('/api/v1/task/getAllTasks', {
            method: 'GET'
        })
            .then(async response => {
                if (response.status !== 200) {
                    const data = await response.json();
                    console.error("Failed to get tasks: ", data.message);
                    throw new Error(data.message || 'Failed to get tasks');
                }
                return response.json();
            })
            .then(data => {
                if (data.data) {
                    setTasks(JSON.parse(data.data));
                }
                setIsLoading(false);
            })
    }, []);

    return { tasks, isLoading };
}


export default function TaskBoard() {

    const {tasksByStatus, isLoading} = loadTasksWithStatus();

    if (isLoading) {
        return <div>Loading...</div>; // You can replace this with a spinner or loading component
    }

    console.log(tasksByStatus)

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tasksByStatus && Object.entries(tasksByStatus).map(([status,tasks]) => (
                <TaskColumn
                    key={status}
                    status={status}
                    tasks={tasks}
                />
            ))}
        </div>
    );
}
