import forms from "@tailwindcss/forms";

export default {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        forest: { 950: "#142c25", 900: "#1d3b2d", 800: "#28533b", 700: "#376a49" },
        parchment: { 50: "#fffaf0", 100: "#f8edce", 200: "#ecd9a8" },
        wood: { 500: "#9a6737", 700: "#694329", 900: "#3c291e" },
        harvest: "#e8b83f"
      },
      boxShadow: { pixel: "0 6px 0 #2b1c15" }
    }
  },
  plugins: [forms]
};
