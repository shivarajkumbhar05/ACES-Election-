/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        aces: {
          purple: {
            50: "#f4f2fb",
            100: "#e7e2f7",
            200: "#cabded",
            300: "#a58ede",
            400: "#8560d4",
            500: "#6a3fc4",
            600: "#4c2aa6",
            700: "#3a1f84",
            800: "#2d1968",
            900: "#1f1149",
            950: "#140b32",
          },
          gold: {
            300: "#fbdd8c",
            400: "#f5c451",
            500: "#e7a92c",
            600: "#c8871b",
          },
        },
      },
      fontFamily: {
        display: ["'Lexend'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(31, 17, 73, 0.06), 0 8px 24px -12px rgba(31, 17, 73, 0.18)",
        panel: "0 2px 6px rgba(31, 17, 73, 0.08), 0 16px 40px -20px rgba(31, 17, 73, 0.35)",
      },
      backgroundImage: {
        "gold-line": "linear-gradient(90deg, transparent, #e7a92c, transparent)",
      },
    },
  },
  plugins: [],
};
