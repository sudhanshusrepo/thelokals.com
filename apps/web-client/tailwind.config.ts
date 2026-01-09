import type { Config } from "tailwindcss";
import { colors } from "@thelocals/platform-core/theme/colors";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "../../packages/ui-web/src/**/*.{js,ts,jsx,tsx}",
        "../../packages/platform-core/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    ...colors.client.primary,
                    DEFAULT: colors.client.primary[500],
                },
                background: colors.client.background,
                v2: {
                    bg: '#F0F0F0',
                    surface: '#FFFFFF',
                    text: {
                        primary: '#0E121A',
                        secondary: 'rgba(14, 18, 26, 0.87)',
                    },
                    accent: {
                        danger: '#FC574E',
                        warning: '#F7C846',
                        success: '#8AE98D',
                    }
                }
            },
            backgroundImage: {
                'v2-gradient': 'linear-gradient(135deg, #F7C846 0%, #8AE98D 100%)',
            },
            borderRadius: {
                'v2-hero': '24px',
                'v2-card': '16px',
                'v2-pill': '20px',
            },
            boxShadow: {
                'v2-card': '0 8px 32px rgba(14, 18, 26, 0.08)',
                'v2-hero-glow': '0 0 0 1px rgba(247, 200, 70, 0.2) inset',
                'v2-floating': '0 12px 40px rgba(252, 87, 78, 0.15)',
            }
        },
    },
    plugins: [],
};
export default config;
