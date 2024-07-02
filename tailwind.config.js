/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      daisyui: {
        themes: ["light", "dark", "cupcake,","lemonade"],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
}

