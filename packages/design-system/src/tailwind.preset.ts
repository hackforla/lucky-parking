import styles from "./dictionary/styles.js"

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
		colors: styles.color,
		fontFamily: styles.font.family,
		fontWeight: styles.font.weight,
    extend: {},
  },
  plugins: [],
};
