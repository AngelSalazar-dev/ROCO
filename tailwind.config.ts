import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      colors: {
        roco: {
          bg: "#fafaf9",
          text: "#1e293b",
          accent: "#1e3a5f",
          muted: "#94a3b8",
          border: "#e2e8f0",
          success: "#22c55e",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
