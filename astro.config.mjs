import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import node from '@astrojs/node';
import { remarkMarkdocTable } from './src/utils/remark-markdoc-table.ts';
import { remarkMarkdocVideo } from './src/utils/remark-markdoc-video.ts';
import { rehypeMarkdownImageMeta } from './src/utils/rehype-markdown-image-meta.ts';

const isBuild = process.argv.includes('build') || process.env.npm_lifecycle_event === 'build';

// https://astro.build/config
export default defineConfig({
  site: 'https://ok-lab-karlsruhe.de',
  output: 'static',
  adapter: isBuild ? netlify() : node({ mode: 'standalone' }),
  integrations: [react(), keystatic(), sitemap()],
  markdown: {
    remarkPlugins: [remarkMarkdocTable, remarkMarkdocVideo],
    rehypePlugins: [rehypeMarkdownImageMeta],
  },
  redirects: {
    '/portale': '/daten#portale',
    '/organisationen': '/daten#organisationen',
    '/veranstaltungen': '/events',
  },
});
