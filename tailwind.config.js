/** @type {import('tailwindcss').Config} */

import withMT from "@material-tailwind/html/utils/withMT";
import { mtConfig } from "@material-tailwind/react";


module.exports = withMT({
    content: [
        "./assets/**/*.js",
        "./templates/**/*.html.twig",
        "./node_modules/@material-tailwind/react/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {},
    },
    plugins: [mtConfig],
});
