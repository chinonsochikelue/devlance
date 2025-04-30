import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // your backgroundImage, borderRadius, chart colors, keyframes, etc.
    },
    colors: {
      // 💡 Moved to top-level `theme.colors` so it works with Tailwind utilities
      border: 'hsl(var(--border))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      // other global color variables can go here if you want direct utility support
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
