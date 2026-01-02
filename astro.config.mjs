// @ts-check

import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import expressiveCode from "astro-expressive-code";
import sitemap from "@astrojs/sitemap";

import { rehypeHeadingIds } from "@astrojs/markdown-remark";

import rehypeAutolinkHeadings from "rehype-autolink-headings";

// https://astro.build/config
export default defineConfig({
  site: "https://qustrolabe.github.io",
  integrations: [
    expressiveCode({
      themes: ["gruvbox-dark-hard"],
    }),
    mdx(),
    sitemap(),
    solidJs(),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // minify: 'terser', // need terser dep
      // cssMinify: 'lightningcss'
    },
  },
  markdown: {
    rehypePlugins: [rehypeHeadingIds, [
      rehypeAutolinkHeadings,
      {
        behavior: "wrap",
        properties: {
          class: ["heading-link"],
          title: "Link to heading",
        },
      },
    ]],
  },
});
