import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        governance: {
          blue: "#4A67FF",
          blueSoft: "#7B88C9",
          bg: "#F5F7FC",
          ink: "#1D2438",
          muted: "#6D7690",
          accent: "#27B3A8",
          success: "#2FBF71",
          warning: "#F0A53A",
          danger: "#E85D6A",
        },
      },
      boxShadow: {
        panel: "0 18px 40px rgba(74, 103, 255, 0.08)",
      },
      borderRadius: {
        panel: "24px",
      },
    },
  },
  plugins: [],
};

export default config;
