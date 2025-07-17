import {Xmark} from "iconoir-react";
import {Dialog, Button, Input, Typography, IconButton, Textarea, Popover, Radio} from "@material-tailwind/react";
import {DayPicker} from "react-day-picker";
import "react-day-picker/style.css";

import {format} from "date-fns";

import * as React from "react";
import { StrictMode } from 'react';


import {DialogOpenButton} from "./AddTaskButton";

export default function (props) {

    const [date, setDate] = React.useState();
    const [priority, setPriority] = React.useState("high");

    console.log(props)
    return (
        <Dialog size="xl">
            <Dialog.Trigger as={DialogOpenButton}
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"></Dialog.Trigger>
            <Dialog.Overlay>
                <Dialog.Content className="w-[95vw] sm:w-[80vw] md:w-[60vw] lg:w-[40vw] max-w-5xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl shadow-slate-950/5">
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
                    <form className="mt-4 sm:mt-6" action={props.url}>
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
                                type="text"
                                placeholder="Task Title..."
                                className="text-sm"
                            />
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
                            <Textarea id="description" placeholder="Task Description..." rows={6} className="text-sm"/>
                        </div>
                        <Typography
                            as="label"
                            htmlFor="priority"
                            type="small"
                            color="default"
                            className="font-semibold text-sm"
                        >
                            Priority
                        </Typography>
                        <Radio id="priority" className="mb-3 sm:mb-4" value={priority} onValueChange={setPriority} orientation="vertical">
                            <div className="flex items-center gap-2">
                                <Radio.Item id="high" name="priority" value="high" color="error" className="border border-gray-300 rounded-full w-5 h-5 data-[checked=true]:bg-red-400">
                                    <Radio.Indicator className="bg-red-500 w-3 h-3 rounded-full absolute top-1 left-1" />
                                </Radio.Item>
                                <Typography as="label" htmlFor="high" className="text-foreground text-sm">
                                    High
                                </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                                <Radio.Item id="medium" name="priority" value="medium" color="amber" className="border border-gray-300 rounded-full w-5 h-5 data-[checked=true]:bg-amber-500">
                                    <Radio.Indicator className="bg-amber-500 w-3 h-3 rounded-full absolute top-1 left-1" />
                                </Radio.Item>
                                <Typography as="label" htmlFor="medium" className="text-foreground text-sm">
                                    Medium
                                </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                                <Radio.Item id="low" name="priority" value="low" color="green" className="border border-gray-300 rounded-full w-5 h-5 data-[checked=true]:bg-green-500">
                                    <Radio.Indicator className="bg-green-500 w-3 h-3 rounded-full absolute top-1 left-1" />
                                </Radio.Item>
                                <Typography as="label" htmlFor="low" className="text-foreground text-sm">
                                    Low
                                </Typography>
                            </div>
                        </Radio>
                        <div className="mb-3 sm:mb-4 space-y-1.5">
                            <Typography
                                as="label"
                                htmlFor="due-date"
                                type="small"
                                color="default"
                                className="font-semibold text-sm"
                            >
                                Due Date
                            </Typography>
                            <Popover placement="bottom">
                                <Popover.Trigger className="relative w-full">
                                    <div className="relative w-full">
                                        <Input type="date" id="due-date" readOnly onChange={() => null} onClick={e => e.preventDefault()} placeholder="Due Date"
                                               value={date ? format(date, "PPP") : ""} className="text-sm"/>
                                    </div>
                                </Popover.Trigger>
                                <Popover.Content id="popover-content" className="max-w-[95vw] sm:max-w-md overflow-auto z-50 shadow-lg border border-gray-200 bg-white">
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
                                className="bg-slate-800 border-slate-800 text-slate-50 hover:bg-slate-700 hover:border-slate-700 text-sm py-2.5">Add
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
