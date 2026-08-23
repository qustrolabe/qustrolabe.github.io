// @ts-check
import eslintPluginAstro from "eslint-plugin-astro";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import tseslint from "typescript-eslint";

/** Shared options so every rule validates against our real theme tokens */
const betterTailwindOptions = {
    entryPoint: "src/styles/global.css",
    attributes: ["class", "class:list"],
};

/** Append shared options to every rule coming from a plugin preset.
 *  @param {{ rules?: Record<string, unknown> } | Array<{ rules?: Record<string, unknown> }>} preset
 *  @returns {any[]} */
const withOptions = (preset) =>
    (Array.isArray(preset) ? preset : [preset]).map((config) => ({
        ...config,
        rules: Object.fromEntries(
            Object.entries(config.rules ?? {}).map(([rule, setting]) => [
                rule,
                Array.isArray(setting)
                    ? [...setting, betterTailwindOptions]
                    : [setting, betterTailwindOptions],
            ]),
        ),
    }));

export default tseslint.config(
    {
        ignores: ["dist/**", ".astro/**", "public/**", "src/assets/**"],
    },
    {
        files: ["**/*.js", "**/*.mjs", "**/*.ts", "**/*.tsx"],
        extends: [...tseslint.configs.recommended],
    },
    ...eslintPluginAstro.configs["flat/recommended"],
    ...withOptions(betterTailwindcss.configs.recommended),
    {
        rules: {
            // class formatting/sorting is Prettier's job (prettier-plugin-tailwindcss)
            "better-tailwindcss/enforce-consistent-line-wrapping": "off",
            "better-tailwindcss/no-unknown-classes": [
                "error",
                {
                    ...betterTailwindOptions,
                    // semantic classes styled in component <style> blocks, not Tailwind utilities
                    ignore: ["^(hero-image|title|date|last-updated-on)$"],
                },
            ],
        },
    },
);
