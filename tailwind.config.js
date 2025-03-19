/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // Enables class-based dark mode
  theme: {
    extend: {
      colors: {
        lightBg: "#e3eaf2", // Light theme background (slightly gray)
        darkBg: "#0f172a", // Dark theme background (not completely black)
        navbarLight: "#f8f9fa", // Light theme navbar (very light gray)
        navbarDark: "#1e293b", // Dark theme navbar (blue-gray)
        textLight: "#333333", // Dark text for light mode
        textDark: "#e0e0e0", // Light text for dark mode
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
