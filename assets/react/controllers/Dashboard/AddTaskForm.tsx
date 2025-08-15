import {Xmark} from "iconoir-react";
import {Dialog, Button, Input, Typography, IconButton, Textarea, Popover, Radio} from "@material-tailwind/react";
import {DayPicker} from "react-day-picker";
import "react-day-picker/style.css";

import {format} from "date-fns";

import * as React from "react";
import { useTasks } from "../../hooks/useTasks";

import {DialogOpenButton} from "./AddTaskButton";

// Define interfaces for TypeScript
interface AddTaskFormProps {
    url: string;
    priorities: Record<string, string>;
    csfr_token?: string; // Optional CSRF token for security
    onTaskAdded?: () => void; // Callback for when task is successfully added
}

interface FormData {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    due_date: Date | null;
    csfr_token: string; // CSRF token for form submission
}

interface FormErrors {
    title?: string | null;
    description?: string | null;
    priority?: string | null;
    due_date?: string | null;
}

type PriorityValue = "low" | "medium" | "high";

export default function AddTaskForm({ url, priorities, csfr_token, onTaskAdded }: AddTaskFormProps) {
    const { createTask, isLoading, error } = useTasks();

    const [formData, setFormData] = React.useState<FormData>({
        title: "",
        description: "",
        priority: "low", // Default priority
        due_date: null,
        csfr_token: csfr_token || ""
    });

    const [errors, setErrors] = React.useState<FormErrors>({});
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {id, value} = e.target;
        setFormData({
            ...formData,
            [id]: value
        });

        // Clear error when user types
        if (errors[id as keyof FormErrors]) {
            setErrors({
                ...errors,
                [id]: null
            });
        }
    };

    const handlePriorityChange = (value: string) => {
        setFormData({
            ...formData,
            priority: value as PriorityValue
        });
    };

    const handleDateChange = (selectedDate: Date | undefined) => {
        setFormData({
            ...formData,
            due_date: selectedDate || null
        });
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const priorityMap: Record<PriorityValue, string> = {
            "high": "High",
            "medium": "Medium",
            "low": "Low"
        };

        const taskData = {
            title: formData.title,
            description: formData.description,
            priority: priorityMap[formData.priority],
            due_date: formData.due_date ? format(formData.due_date, "yyyy-MM-dd") : undefined,
        };

        const success = await createTask(taskData);

        if (success) {
            // Reset form on success
            setFormData({
                title: "",
                description: "",
                priority: "low",
                due_date: null,
                csfr_token: csfr_token || ""
            });

            // Show success notification
            if (window.notifications) {
                window.notifications.success('Task Created', `"${taskData.title}" has been added successfully`);
            }

            // Call the callback to update the parent component
            onTaskAdded?.();
        } else {
            // Show error notification
            if (window.notifications) {
                window.notifications.error('Failed to Create Task', error || 'An unknown error occurred');
            }
        }
    };

    return (
        <Dialog size="xl">
            <Dialog.Trigger as={DialogOpenButton}
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"></Dialog.Trigger>
            <Dialog.Overlay className="flex items-center justify-center min-h-screen">
                <Dialog.Content
                    className="relative w-[95vw] sm:w-[80vw] md:w-[60vw] lg:w-[40vw] max-w-5xl bg-white dark:bg-gray-500 rounded-xl shadow-2xl shadow-slate-950/5 p-6">
                    <Dialog.DismissTrigger
                        as={IconButton}
                        size="sm"
                        variant="ghost"
                        color="secondary"
                        className="absolute right-2 top-2"
                        isCircular
                    >
                        <Xmark className="h-5 w-5 dark:text-white dark:border-white"/>
                    </Dialog.DismissTrigger>
                    <Typography
                        type="small"
                        className="mb-2 mt-3 flex items-center justify-center gap-1 text-foreground"
                    >
                    </Typography>
                    <Typography type="h1" className="mb-1 text-lg sm:text-xl text-slate-800 font-bold dark:text-white text-center">
                        Add Task
                    </Typography>
                    <form className="mt-4 sm:mt-6" onSubmit={handleSubmit}>
                        <div className="mb-3 sm:mb-4 mt-2 space-y-1.5">
                            <Typography
                                as="label"
                                htmlFor="title"
                                type="small"
                                color="default"
                                className="font-semibold text-base"
                            >
                                Title
                            </Typography>
                            <Input
                                id="title"
                                name="title"
                                type="text"
                                placeholder="Task Title..."
                                className={`text-sm p-2 ${errors.title ? 'border-red-500' : ''}`}
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
                                className="font-semibold text-base"
                            >
                                Description
                            </Typography>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Task Description..."
                                rows={6}
                                className="text-sm p-2"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-4 sm:mb-4 space-y-2">
                            <Typography
                                as="label"
                                type="small"
                                color="default"
                                className="font-semibold text-base mb-2 block"
                            >
                                Priority
                            </Typography>
                            <Radio id="priority" className="space-y-3 sm:space-y-2" value={formData.priority}
                                   onValueChange={handlePriorityChange} orientation="vertical">
                                {Object.entries(priorities).map(([priorityValue]) => {
                                    // Map priority values to radio button values
                                    const radioValue = priorityValue.toLowerCase() as PriorityValue;
                                    const priorityId = radioValue;

                                    const colorClassMap: Record<PriorityValue, string> = {
                                        high: "data-[checked=true]:bg-red-500",
                                        medium: "data-[checked=true]:bg-yellow-500",
                                        low: "data-[checked=true]:bg-green-500"
                                    };
                                    return (
                                        <div key={priorityId} className="flex items-center gap-3 py-2 sm:py-1 cursor-pointer" onClick={() => handlePriorityChange(radioValue)}>
                                            <Radio.Item
                                                id={priorityId}
                                                value={radioValue}
                                                name="priority"
                                                className={`border border-gray-300 rounded-full w-6 h-6 sm:w-5 sm:h-5 ${colorClassMap[radioValue]} cursor-pointer`}
                                            >
                                                <Radio.Indicator
                                                    className={`w-4 h-4 sm:w-3 sm:h-3 rounded-full absolute top-1 left-1`}/>
                                            </Radio.Item>
                                            <Typography as="label" htmlFor={priorityId}
                                                        className="text-foreground text-base sm:text-sm dark:text-white cursor-pointer flex-1">
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
                                className="font-semibold text-base"
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
                                            onClick={(e: React.MouseEvent) => e.preventDefault()}
                                            placeholder="Due Date"
                                            value={formData.due_date ? format(formData.due_date, "PPP") : ""}
                                            className="text-sm p-2 cursor-pointer"
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
                                        showOutsideDays={false}

                                        className="border-0"
                                    />
                                </Popover.Content>
                            </Popover>
                        </div>
                        <div className="mb-3 sm:mb-4 space-y-1.5" >
                            <Button
                                type="submit"
                                isFullWidth={true}
                                className="bg-slate-800 border-slate-800 text-slate-50 hover:bg-slate-700  dark:bg-blue-600 dark:border-blue-600  dark:hover:bg-blue-500 dark:text-white hover:border-slate-700 text-sm py-2.5 w-full"
                            >
                                Add Task
                            </Button>
                            <input type="hidden" name="csrfmiddlewaretoken" value={csfr_token || ""}/>
                        </div>
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
