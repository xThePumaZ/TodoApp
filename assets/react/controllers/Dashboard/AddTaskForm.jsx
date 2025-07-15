import {Xmark} from "iconoir-react";
import {Dialog, Button, Input, Typography, IconButton, Textarea, Popover, Radio} from "@material-tailwind/react";
import {DayPicker} from "react-day-picker";
import "react-day-picker/style.css";


import {format} from "date-fns";

import * as React from "react";

import {DialogOpenButton} from "./AddTaskButton";

export default function () {

    const [date, setDate] = React.useState();
    const [priority, setPriority] = React.useState("html");


    return (
        <Dialog size="xl">
            <Dialog.Trigger as={DialogOpenButton}
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"></Dialog.Trigger>
            <Dialog.Overlay>
                <Dialog.Content className="w-[40vw] max-w-5xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl shadow-slate-950/5">
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
                    <Typography type="h1" className="mb-1 text-xl text-slate-800 font-bold dark:text-white">
                        Add Task
                    </Typography>
                    <form className="mt-6">
                        <div className="mb-4 mt-2 space-y-1.5">
                            <Typography
                                as="label"
                                htmlFor="title"
                                type="small"
                                color="default"
                                className="font-semibold"
                            >
                                Title
                            </Typography>
                            <Input
                                id="title"
                                type="text"
                                placeholder="Task Title..."
                            />
                        </div>
                        <div className="mb-4 space-y-1.5">
                            <Typography
                                as="label"
                                htmlFor="description"
                                type="small"
                                color="default"
                                className="font-semibold"
                            >
                                Description
                            </Typography>
                            <Textarea id="description" placeholder="Task Description..." rows={8}/>
                        </div>
                        <Typography
                            as="label"
                            htmlFor="priority"
                            type="small"
                            color="default"
                            className="font-semibold"
                        >
                            Priority
                        </Typography>
                        <Radio id="priority" className="mb-4" color="error">
                            <div className="flex items-center gap-2">
                                <Radio.Item id="html" name="priority" value="html" color="error">
                                    <Radio.Indicator />
                                </Radio.Item>
                                <Typography as="label" htmlFor="html" className="text-foreground">
                                    HTML
                                </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                                <Radio.Item id="react" name="priority" value="react">
                                    <Radio.Indicator />
                                </Radio.Item>
                                <Typography as="label" htmlFor="react" className="text-foreground">
                                    React
                                </Typography>
                            </div>
                        </Radio>

                        <div className="mb-4 space-y-1.5">
                            <Popover placement="bottom">
                                <Popover.Trigger className="relative w-full">
                                    <div className="relative w-full">
                                        <Input type="date" id="due-date" readOnly onChange={() => null} onClick={e => e.preventDefault()} placeholder="Due Date"
                                               value={date ? format(date, "PPP") : ""}/>
                                    </div>
                                </Popover.Trigger>
                                <Popover.Content id="popover-content" className="max-w-md overflow-auto z-50 shadow-lg border border-gray-200 bg-white">
                                    <Popover.Arrow/>
                                    <DayPicker
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        showOutsideDays
                                        className="border-0"
                                    />
                                </Popover.Content>
                            </Popover>
                        </div>
                        <Button isFullWidth
                                className="bg-slate-800 border-slate-800 text-slate-50 hover:bg-slate-700 hover:border-slate-700">Add
                            Task</Button>
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
