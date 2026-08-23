// @ts-check
import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: ["dist/**", ".astro/**", "public/**", "src/assets/**"],
	},
	{
		files: ["**/*.js", "**/*.mjs", "**/*.ts", "**/*.tsx"],
		extends: [...tseslint.configs.recommended],
	},
	...eslintPluginAstro.configs["flat/recommended"],
);
