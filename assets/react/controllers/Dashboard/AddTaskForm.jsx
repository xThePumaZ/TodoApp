import {Xmark, NavArrowRight, NavArrowLeft} from "iconoir-react";
import {Dialog, Button, Input, Checkbox, Typography, IconButton, Textarea, Popover} from "@material-tailwind/react";
import {DayPicker} from "react-day-picker";
import {format} from "date-fns";

import * as React from "react";

import {DialogOpenButton} from "./AddTaskButton";

export default function () {

    const [date, setDate] = React.useState();

    return (
        <Dialog size="xl">
            <Dialog.Trigger as={DialogOpenButton}
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"></Dialog.Trigger>
            <Dialog.Overlay>
                <Dialog.Content className="w-[90vw] max-w-5xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl shadow-slate-950/5">
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
                        <div className="mb-8 space-y-1.5">
                            <Popover placement="right">
                                <Popover.Trigger>
                                    <div className="w-72">
                                        <Input type="date" id="due-date" readOnly onChange={() => null} onClick={e => e.preventDefault()} placeholder="Due Date"
                                               value={date ? format(date, "PPP") : ""}/>

                                    </div>
                                </Popover.Trigger>
                                <Popover.Content id="popover-content">
                                    <Popover.Arrow/>
                                    <DayPicker
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        showOutsideDays
                                        className="border-0"
                                        classNames={{
                                            day_hidden: "invisible",
                                            nav: "flex items-center",
                                            day: "h-9 w-9 p-0 ",
                                            day_range_end: "day-range-end",
                                            table: "w-full border-collapse",
                                            nav_button_next: "absolute right-1.5",
                                            nav_button_previous: "absolute left-1.5",
                                            head_row: "flex font-medium text-black dark:text-white",
                                            day_disabled: "text-foreground opacity-50",
                                            head_cell: "m-0.5 w-9  text-sm",
                                            day_today: "rounded-md bg-surface text-black dark:text-white",
                                            caption_label: "text-sm font-medium text-black dark:text-white",
                                            caption: "flex justify-center py-2 mb-4 relative items-center",
                                            nav_button:
                                                "h-6 w-6 bg-transparent hover:bg-primary/10 p-1 rounded transition-colors duration-300",
                                            row: "flex w-full mt-2",
                                            day_selected:
                                                "rounded-md bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
                                            day_outside:
                                                "day-outside text-foreground opacity-50 aria-selected:bg-primary-light aria-selected:text-black dark:aria-selected:text-white aria-selected:bg-opacity-10",
                                            cell: "text-foreground rounded-md h-9 w-9 text-center text-sm p-0 m-0.5 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-primary/20 [&:has([aria-selected].day-outside)]:text-white [&:has([aria-selected])]:bg-primary/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                        }}
                                        components={{
                                            IconLeft: ({...props}) => (
                                                <NavArrowLeft {...props} className="h-4 w-4 stroke-2"/>
                                            ),
                                            IconRight: ({...props}) => (
                                                <NavArrowRight {...props} className="h-4 w-4 stroke-2"/>
                                            ),
                                        }}
                                    />
                                </Popover.Content>
                            </Popover>
                        </div>
                        <div className="mb-4 flex items-center gap-2">
                            <Checkbox id="checkbox">
                                <Checkbox.Indicator/>
                            </Checkbox>
                            <Typography
                                as="label"
                                htmlFor="checkbox"
                                className="text-foreground"
                            >
                                Remember Me
                            </Typography>
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
