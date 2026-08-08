import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aanu: {
          bg: "#0f1115",
          surface: "#171a21",
          accent: "#5eead4",
          accentDark: "#0d9488",
          warn: "#facc15",
        },
      },
    },
  },
  plugins: [],
};
export default config;
