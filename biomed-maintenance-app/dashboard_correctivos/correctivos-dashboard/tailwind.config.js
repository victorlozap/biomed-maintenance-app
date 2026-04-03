/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070A1A",
        glass: "rgba(255,255,255,0.10)",
        glassBorder: "rgba(255,255,255,0.18)",
        gold: "#F7C948",
        neonCyan: "#22D3EE",
        neonTeal: "#14B8A6",
        neonViolet: "#8B5CF6",
      },
      boxShadow: {
        glass: "0 20px 60px rgba(0,0,0,0.45)",
        glowGold: "0 0 18px rgba(247,201,72,0.55)",
        glowCyan: "0 0 18px rgba(34,211,238,0.40)",
      },
      dropShadow: {
        gold: "0 0 12px rgba(247,201,72,0.65)",
      },
      backdropBlur: {
        xl: "24px",
      },
    },
  },
  plugins: [],
};
