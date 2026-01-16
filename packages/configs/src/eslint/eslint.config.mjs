import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	...nextVitals,
	...nextTs,
	{
		rules: {
			"@typescript-eslint/ban-ts-comment": [
				"error",
				{
					"ts-check": false,
					"ts-expect-error": "allow-with-description",
					"ts-ignore": "allow-with-description",
					"ts-nocheck": false,
				},
			],
			"react-hooks/purity": "warn",
			"react-hooks/set-state-in-effect": "warn",
		},
	},
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
