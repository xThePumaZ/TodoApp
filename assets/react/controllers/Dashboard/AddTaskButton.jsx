import React from "react";
import { Button } from "@material-tailwind/react";

export const DialogOpenButton = React.forwardRef(function DialogOpenButton(props, ref) {
    return (
        <Button
            ref={ref}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            {...props}>
            Add Task
        </Button>
    );
});
