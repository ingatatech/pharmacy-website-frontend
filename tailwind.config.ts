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
        ink: "#12241F",
        brand: {
          DEFAULT: "#0E4B3D",
          deep: "#0A362C",
          light: "#1E7A5F",
        },
        paper: "#F6F9F7",
        sage: "#E3EEE8",
        gold: "#CE9A4A",
        line: "#D6E0DB",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-plex-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
