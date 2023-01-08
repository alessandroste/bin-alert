/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        "garden-dark": {
          "color-scheme": "dark",
          primary: "#5c7f67",
          secondary: "#ecf4e7",
          "secondary-content": "#24331a",
          accent: "#fae5e5",
          "accent-content": "#322020",
          neutral: "#23282E",
          "base-100": "#202020",
        },
      },
      "garden",
    ],
    logs: false
  }
}
