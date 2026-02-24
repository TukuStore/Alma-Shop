/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#FF6B57',
                    light: '#FF8A7A',
                },
                accent: {
                    DEFAULT: '#121926',
                    dark: '#000000',
                },
                info: '#0076F5',
                bg: '#FFFFFF',
                surface: '#F8FAFC',
                text: {
                    DEFAULT: '#121926',
                    muted: '#9AA4B2',
                },
                border: '#E3E8EF',
                success: '#00D79E',
                error: '#FF3E38',
                warning: '#FFB13B',
                // ─── Figma Neutral Palette (full) ──────────────
                neutral: {
                    25: '#FCFCFD',
                    50: '#F8FAFC',
                    100: '#EEF2F6',
                    200: '#E3E8EF',
                    300: '#CDD5DF',
                    400: '#9AA4B2',
                    500: '#697586',
                    600: '#4B5565',
                    700: '#364152',
                    800: '#202939',
                    900: '#121926',
                },
                // ─── Base Colors ───────────────────────────────
                base: {
                    white: '#FFFFFF',
                    black: '#000000',
                },
            },
            fontFamily: {
                'playfair': ['PlayfairDisplay_700Bold'],
                'playfair-semibold': ['PlayfairDisplay_600SemiBold'],
                'inter': ['Inter_400Regular'],
                'inter-medium': ['Inter_500Medium'],
                'inter-semibold': ['Inter_600SemiBold'],
                'inter-bold': ['Inter_700Bold'],
            },
            fontSize: {
                'display': ['32px', { lineHeight: '40px', fontWeight: '700' }],
                'h1': ['24px', { lineHeight: '32px', fontWeight: '600' }],
                'h2': ['20px', { lineHeight: '28px', fontWeight: '600' }],
                'h3': ['16px', { lineHeight: '24px', fontWeight: '500' }],
                'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
                'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
                'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
                'price': ['18px', { lineHeight: '24px', fontWeight: '700' }],
                'button': ['14px', { lineHeight: '20px', fontWeight: '600' }],
            },
            borderRadius: {
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                'full': '9999px',
            },
            boxShadow: {
                // ─── Figma Shadow Tokens ───────────────────────
                'xs': '0 1px 2px rgba(28,32,43,0.06)',
                'sm': '0 1px 2px rgba(28,32,43,0.04), 0 1px 3px rgba(28,32,43,0.05)',
                'md': '0 4px 8px -1px rgba(28,32,43,0.02), 0 5px 10px -2px rgba(28,32,43,0.04)',
                'lg': '0 4px 6px -2px rgba(28,32,43,0.03), 0 12px 16px -4px rgba(28,32,43,0.08)',
                'xl': '0 24px 48px -12px rgba(28,32,43,0.12)',
                'xxl': '0 24px 48px -12px rgba(28,32,43,0.30)',
            },
        },
    },
    plugins: [],
};
