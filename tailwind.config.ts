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
        arc: {
          bg: "#0B0E14",
          surface: "#121722",
          surfaceHover: "#182030",
          border: "#1E2638",
          cyan: "#00D2FF",
          blue: "#2775CA",
          green: "#10B981",
          text: "#F8FAFC",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
