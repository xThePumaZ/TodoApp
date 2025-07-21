import {Xmark} from "iconoir-react";
import {Dialog, Button, Input, Typography, IconButton, Textarea, Popover, Radio} from "@material-tailwind/react";
import {DayPicker} from "react-day-picker";
import "react-day-picker/style.css";

import {format} from "date-fns";

import * as React from "react";
import {StrictMode} from 'react';


import {DialogOpenButton} from "./AddTaskButton";

export default function (props) {

    // Form state
    const [formData, setFormData] = React.useState({
        title: "",
        description: "",
        priority: "low", // Default priority
        due_date: null
    });

    // Validation state
    const [errors, setErrors] = React.useState({});

    // Handle input changes
    const handleInputChange = (e) => {
        const {id, value} = e.target;
        setFormData({
            ...formData,
            [id]: value
        });

        // Clear error when user types
        if (errors[id]) {
            setErrors({
                ...errors,
                [id]: null
            });
        }
    };

    // Handle priority change
    const handlePriorityChange = (value) => {
        setFormData({
            ...formData,
            priority: value
        });
    };

    // Handle date change
    const handleDateChange = (selectedDate) => {
        setFormData({
            ...formData,
            due_date: selectedDate
        });
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Map priority values to match the backend enum
        const priorityMap = {
            "high": "High",
            "medium": "Medium",
            "low": "Low"
        };

        // For debugging - log the priorities prop structure
        console.log("Priorities prop:", props.priorities);

        // Create form data for submission
        const formSubmitData = new FormData();
        formSubmitData.append('title', formData.title);

        if (formData.description) {
            formSubmitData.append('description', formData.description);
        }

        formSubmitData.append('priority', priorityMap[formData.priority]);

        if (formData.due_date) {
            // Format date as YYYY-MM-DD
            const dateObj = formData.due_date;
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            formSubmitData.append('due_date', `${year}-${month}-${day}`);
        }

        // Submit the form using fetch
        fetch(props.url, {
            method: 'POST',
            body: formSubmitData
        })
            .then(response => {
                if (response.ok) {
                    // Reset form on success
                    setFormData({
                        title: "",
                        description: "",
                        priority: "high",
                        due_date: null
                    });

                    // Reload the page to show the new task
                    window.location.reload();
                } else {
                    return response.text().then(text => {
                        throw new Error(text || 'Failed to add task');
                    });
                }
            })
            .catch(error => {
                console.error('Error adding task:', error);
                alert('Failed to add task: ' + error.message);
            });
    };

    return (
        <Dialog size="xl">
            <Dialog.Trigger as={DialogOpenButton}
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"></Dialog.Trigger>
            <Dialog.Overlay>
                <Dialog.Content
                    className="w-[95vw] sm:w-[80vw] md:w-[60vw] lg:w-[40vw] max-w-5xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl shadow-slate-950/5">
                    <Dialog.DismissTrigger
                        as={IconButton}
                        size="sm"
                        variant="ghost"
                        color="secondary"
                        className="absolute right-2 top-2"
                        isCircular
                    >
                        <Xmark className="h-5 w-5"/>
                    </Dialog.DismissTrigger>
                    <Typography
                        type="small"
                        className="mb-2 mt-3 flex items-center justify-center gap-1 text-foreground"
                    >
                    </Typography>
                    <Typography type="h1" className="mb-1 text-lg sm:text-xl text-slate-800 font-bold dark:text-white">
                        Add Task
                    </Typography>
                    <form className="mt-4 sm:mt-6" onSubmit={handleSubmit}>
                        <div className="mb-3 sm:mb-4 mt-2 space-y-1.5">
                            <Typography
                                as="label"
                                htmlFor="title"
                                type="small"
                                color="default"
                                className="font-semibold text-sm"
                            >
                                Title
                            </Typography>
                            <Input
                                id="title"
                                name="title"
                                type="text"
                                placeholder="Task Title..."
                                className={`text-sm ${errors.title ? 'border-red-500' : ''}`}
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.title && (
                                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                            )}
                        </div>
                        <div className="mb-3 sm:mb-4 space-y-1.5">
                            <Typography
                                as="label"
                                htmlFor="description"
                                type="small"
                                color="default"
                                className="font-semibold text-sm"
                            >
                                Description
                            </Typography>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Task Description..."
                                rows={6}
                                className="text-sm"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3 sm:mb-4 space-y-1.5">
                            <Radio id="priority" className="mb-3 sm:mb-4" value={formData.priority}
                                   onValueChange={handlePriorityChange} orientation="vertical">
                                {Object.entries(props.priorities).map(([priorityValue, colorClass]) => {
                                    // Map priority values to radio button values
                                    const radioValue = priorityValue.toLowerCase();
                                    const priorityId = radioValue;

                                    const colorClassMap = {
                                        high: "data-[checked=true]:bg-red-500",
                                        medium: "data-[checked=true]:bg-yellow-500",
                                        low: "data-[checked=true]:bg-green-500"
                                    };
                                    return (
                                        <div key={priorityId} className="flex items-center gap-2">
                                            <Radio.Item
                                                id={priorityId}
                                                value={radioValue}
                                                name="priority"
                                                className={`border border-gray-300 rounded-full w-5 h-5 ${colorClassMap[radioValue]}`}
                                            >
                                                <Radio.Indicator
                                                    className={`w-3 h-3 rounded-full absolute top-1 left-1 `}/>
                                            </Radio.Item>
                                            <Typography as="label" htmlFor={priorityId}
                                                        className="text-foreground text-sm dark:text-white">
                                                {priorityValue}
                                            </Typography>
                                        </div>
                                    );
                                })}
                            </Radio>
                        </div>
                        <div className="mb-3 sm:mb-4 space-y-1.5">
                            <Typography
                                as="label"
                                htmlFor="due_date"
                                type="small"
                                color="default"
                                className="font-semibold text-sm"
                            >
                                Due Date
                            </Typography>
                            <Popover placement="bottom">
                                <Popover.Trigger className="relative w-full">
                                    <div className="relative w-full">
                                        <Input
                                            type="date"
                                            id="due_date"
                                            name="due_date"
                                            readOnly
                                            onChange={() => null}
                                            onClick={e => e.preventDefault()}
                                            placeholder="Due Date"
                                            value={formData.due_date ? format(formData.due_date, "PPP") : ""}
                                            className="text-sm"
                                        />
                                    </div>
                                </Popover.Trigger>
                                <Popover.Content id="popover-content"
                                                 className="max-w-[95vw] sm:max-w-md overflow-auto z-50 shadow-lg border border-gray-200 bg-white">
                                    <Popover.Arrow/>
                                    <DayPicker
                                        mode="single"
                                        selected={formData.due_date}
                                        onSelect={handleDateChange}
                                        showOutsideDays
                                        className="border-0"
                                    />
                                </Popover.Content>
                            </Popover>
                        </div>
                        <Button
                            type="submit"
                            isFullWidth
                            className="bg-slate-800 border-slate-800 text-slate-50 hover:bg-slate-700  dark:bg-blue-600 dark:border-blue-600  dark:hover:bg-blue-500 dark:text-white hover:border-slate-700 text-sm py-2.5"
                        >
                            Add Task
                        </Button>
                    </form>
                    <Typography
                        type="small"
                        className="mb-2 mt-3 flex items-center justify-center gap-1 text-foreground"
                    >
                    </Typography>
                </Dialog.Content>
            </Dialog.Overlay>
        </Dialog>
    );
}
