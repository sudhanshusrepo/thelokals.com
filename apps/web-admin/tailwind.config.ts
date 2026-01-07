import { colors } from "@thelocals/platform-core";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: colors.admin.primary,
                neutral: colors.common.slate,
                success: colors.common.success,
                warning: colors.common.warning,
                error: colors.common.error,
                info: colors.common.info,
                background: colors.admin.background.DEFAULT,
                foreground: colors.admin.text.primary,
            }
        },
    },
    plugins: [],
};
export default config;
