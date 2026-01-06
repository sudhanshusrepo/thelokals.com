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
                // Legacy support
                primary: {
                    ...colors.provider.primary,
                    DEFAULT: colors.provider.primary[500],
                },
                // Provider V2 Tokens
                brand: {
                    bg: '#F0F0F0',
                    text: '#0E121A',
                    yellow: '#F7C846',
                    green: '#8AE98D',
                    red: '#FC574E',
                },
                neutral: colors.common.slate,
                success: colors.common.success,
                warning: colors.common.warning,
                error: colors.common.error,
                info: colors.common.info,
                background: '#F0F0F0', // V2 Default
                foreground: '#0E121A', // V2 Default
            },
            fontFamily: {
                sans: ['Poppins', 'sans-serif'], // V2 Typography
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(to right, #F7C846, #8AE98D)',
                'brand-gradient-vertical': 'linear-gradient(to bottom, #F7C846, #8AE98D)',
            },
            borderRadius: {
                'hero': '24px',
                'card': '16px',
                'pill': '20px',
            },
            boxShadow: {
                'card': '0 8px 32px rgba(14,18,26,0.08)',
                'hero': '0 12px 24px rgba(0,0,0,0.15)',
                'floating': '0 8px 16px rgba(138, 233, 141, 0.4)',
            }
        },
    },
    plugins: [],
};
export default config;
