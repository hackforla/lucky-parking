import { designSystemPreset } from "@lucky-parking/design-system";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
	presets: [designSystemPreset],
};
