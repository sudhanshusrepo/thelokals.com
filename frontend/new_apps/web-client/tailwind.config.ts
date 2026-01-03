import type { Config } from "tailwindcss";
import { colors } from "@thelocals/core/theme/colors";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: colors.client.primary,
                background: colors.client.background,
            }
        },
    },
    plugins: [],
};
export default config;
