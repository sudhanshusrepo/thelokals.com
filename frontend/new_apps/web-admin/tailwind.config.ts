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
                primary: colors.provider.primary,
                neutral: colors.common.slate,
                success: colors.common.success,
                warning: colors.common.warning,
                error: colors.common.error,
                info: colors.common.info,
                background: colors.provider.background.DEFAULT,
                foreground: colors.provider.text.primary,
            }
        },
    },
    plugins: [],
};
export default config;
