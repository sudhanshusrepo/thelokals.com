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
                // Lokals Design System
                'lokals-green': '#10B981',
                'lokals-orange': '#FB923C',
                'lokals-yellow': '#FBBF24',
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
                'bg-gradient': 'linear-gradient(135deg, #FEFCE8 0%, #ECFDF5 50%, #EFF6FF 100%)',
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
                // Lokals Shadows
                'card': '0 4px 6px -1px rgba(0, 0,0, 0.1), 0 2px 4px -1px rgba(0, 0,0, 0.06)',
                'card-hover': '0 20px 25px -5px rgba(0, 0,0, 0.1), 0 10px 10px -5px rgba(0, 0,0, 0.04)',
            },
            animation: {
                'fadeIn': 'fadeIn 0.5s ease-out',
                'slideUp': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
