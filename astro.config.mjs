// @ts-check

import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import expressiveCode from "astro-expressive-code";
import sitemap from "@astrojs/sitemap";

import { rehypeHeadingIds } from "@astrojs/markdown-remark";

import rehypeAutolinkHeadings from "rehype-autolink-headings";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  experimental: {
    // relies on package @astrojs/compiler-rs that probably needs removing once compiler-rs goes out of experimental
    rustCompiler: true 
  },
  site: "https://qustrolabe.github.io",
  integrations: [
    expressiveCode({
      defaultProps: {
        frame: "code",
      },
      themes: ["gruvbox-dark-hard"],
    }),
    mdx(),
    sitemap(),
    solidJs(),
    icon({
      include: {
        mdi: ["github", "twitter"],
        "simple-icons": ["bluesky", "x", "telegram"],
      },
    }),
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
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
