/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        reelio: {
          lavender: "#F2EAFE",
          lilac: "#CBB7FF",
          purple: "#8B5CF6",
          blue: "#6EA8FE",
          sky: "#EAF6FF",
          ink: "#202035",
          muted: "#6D6A85",
          blush: "#FFF3F8",
        },
      },
      boxShadow: {
        soft: "0 22px 70px rgba(107, 91, 149, 0.18)",
        button: "0 14px 30px rgba(126, 97, 255, 0.26)",
      },
    },
  },
  plugins: [],
};
