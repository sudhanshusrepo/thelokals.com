/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: content paths must be relative to the project root
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
