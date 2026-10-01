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
        morocco: {
          red: "#C1272D",
          "red-dark": "#7B1115",
          "red-light": "#E83B43",
          green: "#006233",
          "green-dark": "#003D20",
          "green-light": "#008546",
          gold: "#D4AF37",
          "gold-light": "#F5E296",
          night: "#080D14",
          card: "#0F1722",
          border: "#1C2738",
        },
      },
      fontFamily: {
        arcade: ["var(--font-arcade)", "monospace"],
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(193, 39, 45, 0.5)" },
          "100%": { boxShadow: "0 0 25px rgba(0, 98, 51, 0.7)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
