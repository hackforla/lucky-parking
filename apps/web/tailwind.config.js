import { designSystemPreset } from "@lucky-parking/design-system";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
		"./src/**/*.{js,jsx,ts,tsx}", // React components
		"../../packages/ui/src/**/*.{js,ts,jsx,tsx}", // Component usage
    "../../packages/design-system/src/**/*.{js,ts,jsx,tsx,css}", // Theme files
    "../../packages/design-system/theme.css", // CSS-based class usage
	],
	presets: [designSystemPreset],
};
