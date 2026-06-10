import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
    colors: {
        primary: {
            500: '#6366f1', // indigo-500
            600: '#4f46e5', // indigo-600
        },
        indigo: {
            500: '#6366f1',
            600: '#4f46e5',
        },
    },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(200%)' },
                },
            },
            animation: {
                shimmer: 'shimmer 1.5s infinite',
            },
        },
    },
    plugins: [],
}

export default config