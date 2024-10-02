/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "index.html",
    "src/**/*.{html,js,vue}",
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs' : ['0.5rem', {
          lineHeight: '0.75rem'
        }], 
      }
    },
    fontFamily: {
      'tahoma': ['tahoma', 'system-ui']
    }
  },
  plugins: [],
}
