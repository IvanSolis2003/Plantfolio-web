/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2D6A4F",
        secondary: "#52B788",
        accent: "#B7E4C7",
        background: "#F8FAF9",
        surface: "#FFFFFF",
        text: "#1B4332",
        muted: "#6B9E7A",
        danger: "#E63946",
        rare: {
          comun: "#6B9E7A",
          poco: "#F4A261",
          endemica: "#9B5DE5",
          protegida: "#E63946",
          extinta: "#2D3142",
        },
      },
    },
  },
  plugins: [],
};
