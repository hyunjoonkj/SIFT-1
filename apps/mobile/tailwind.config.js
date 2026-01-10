/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: This preset is often required for NativeWind v4
    presets: [require("nativewind/preset")],
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                // The Canvas
                canvas: {
                    DEFAULT: '#FFFFFF', // Cards
                    subtle: '#F7F7F5',  // App Background / Sidebars (Notion Grey)
                },
                // The Ink
                ink: {
                    DEFAULT: '#37352F', // Primary Text
                    subtle: '#9B9A97',  // Metadata / Secondary
                },
                // The Borders
                border: {
                    DEFAULT: '#E3E2E0',
                }
            },
            fontFamily: {
                sans: ['Inter', 'System'],
                mono: ['Menlo', 'SF Mono', 'Courier New', 'monospace'],
            },
            borderRadius: {
                DEFAULT: '6px',
                'md': '8px',
            }
        },
    },
    plugins: [],
}
