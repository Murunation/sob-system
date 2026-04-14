import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        scanline: {
          '0%, 100%': { top: '0%', opacity: '1' },
          '50%': { top: '100%', opacity: '0.6' },
        },
      },
      animation: {
        scanline: 'scanline 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
