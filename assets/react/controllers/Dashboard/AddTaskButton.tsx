import React from "react";
import { Button } from "@material-tailwind/react";

// Define the props interface for the DialogOpenButton
interface DialogOpenButtonProps extends React.ComponentProps<typeof Button> {
  // Inherits all Button props from @material-tailwind/react
}

export const DialogOpenButton = React.forwardRef<
  HTMLButtonElement,
  DialogOpenButtonProps
>(function DialogOpenButton(props, ref) {
    return (
        <Button
            ref={ref}
            className="inline-block px-6 py-3 sm:px-4 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-base sm:text-sm font-medium"
            {...props}>
            Add Task
        </Button>
    );
});
