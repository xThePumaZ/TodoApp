/** @type {import('tailwindcss').Config} */

import withMT from "@material-tailwind/html/utils/withMT";
import { mtConfig } from "@material-tailwind/react";


const mtConfig = {
    const config = {
        content: [...],
        theme: {...},
        plugins: [mtConfig({
            radius: "0",
            fonts: {
                sans: "Lato",
                serif: "DM Serif Display"
            },
            colors: {
                primary: {
                    default: "#fef08a",
                    dark: "#fde047",
                    light: "#fef9c3",
                    foreground: "#030712"
                }
            },
            darkColors: {
                primary: {
                    default: "#5eead4",
                    dark: "#2dd4bf",
                    light: "#99f6e4",
                    foreground: "#030712",
                },
            },
        })],
    };
}

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
