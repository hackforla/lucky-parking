import { type Config } from "prettier";

/**
 * @see https://prettier.io/docs/configuration
 */
export const config: Config = {
	/**
	 * Prettier options
	 * @see https://prettier.io/docs/options
	 */
	arrowParens: "always",
	bracketSameLine: true,
	bracketSpacing: true,
	checkIgnorePragma: true,
	embeddedLanguageFormatting: "auto",
	endOfLine: "lf",
	experimentalOperatorPosition: "end",
	experimentalTernaries: false,
	htmlWhitespaceSensitivity: "css",
	insertPragma: false,
	jsxSingleQuote: false,
	objectWrap: "preserve",
	printWidth: 120,
	proseWrap: "always",
	quoteProps: "as-needed",
	requirePragma: false,
	semi: true,
	singleAttributePerLine: true,
	singleQuote: false,
	tabWidth: 2,
	trailingComma: "es5",
	useTabs: true,

	/**
	 * Plugins
	 */
	plugins: [
		"@homer0/prettier-plugin-jsdoc",
		"@trivago/prettier-plugin-sort-imports",
		"@xeonlink/prettier-plugin-organize-attributes",
		"prettier-plugin-css-order",
		"prettier-plugin-tailwindcss",
	],

	/**
	 * @trivago/prettier-plugin-sort-imports options
	 * @see https://github.com/trivago/prettier-plugin-sort-imports?tab=readme-ov-file#usage
	 */
	importOrder: [
		"^\u0000", // Side-effect imports
		"^(fs|path|crypto|os|http|https|child_process|events|util|url)$", // Node.js modules
		"<THIRD_PARTY_MODULES>", // Third-party modules
		"^@/.+$", // Internal imports
		"^\.\./.+$", // Parent imports
		"^\\./.+$", // Sibling imports
		"\\.css$", // CSS imports
	],
};

export default config;
