import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#00ff94", // Neon Green
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#bd00ff", // Neon Purple
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1f1f1f",
          foreground: "#a3a3a3",
        },
        accent: {
          DEFAULT: "#1f1f1f",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#0a0a0a",
          foreground: "#ffffff",
        },
        border: "#333333",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
