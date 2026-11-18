import { describe, expect, it } from 'vitest';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { remarkMarkdocTable } from './remark-markdoc-table';
import { rehypeMarkdownImageMeta } from './rehype-markdown-image-meta';

async function renderMd(md: string): Promise<string> {
  const processor = await createMarkdownProcessor({
    remarkPlugins: [remarkMarkdocTable],
    rehypePlugins: [rehypeMarkdownImageMeta],
  });
  const result = await processor.render(md);
  return result.code;
}

describe('rehypeMarkdownImageMeta', () => {
  it('wraps markdown image with non-empty alt text in image-meta-wrapper + badge', async () => {
    const html = await renderMd('![Foto vom Workshop, CC BY 4.0](/img/ws.jpg)');

    expect(html).toContain('<span class="image-meta-wrapper">');
    expect(html).toContain('<img src="/img/ws.jpg" alt="Foto vom Workshop, CC BY 4.0">');
    expect(html).toContain('class="image-meta-badge pos-bottom-right"');
    expect(html).toContain('role="tooltip"');
    expect(html).toContain('<span class="meta-text">Foto vom Workshop, CC BY 4.0</span>');
  });

  it('works for images inside markdoc tables', async () => {
    const md = [
      '{% table %}',
      '---',
      '- ![Verwaltungsvorschrift](/a.png)',
      '- ![Repository](/b.png)',
      '{% /table %}',
    ].join('\n');

    const html = await renderMd(md);

    expect(html).toContain(
      '<td><span class="image-meta-wrapper"><img src="/a.png" alt="Verwaltungsvorschrift">'
    );
    expect(html).toContain('<span class="meta-text">Verwaltungsvorschrift</span>');
    expect(html).toContain('<span class="meta-text">Repository</span>');
  });

  it('skips images with empty alt text, SVGs, and linked images', async () => {
    const md = [
      '![](/empty.png)',
      '',
      '![Logo](/logo.svg)',
      '',
      '[![Linked](/linked.png)](https://example.com)',
    ].join('\n');

    const html = await renderMd(md);

    expect(html).not.toContain('image-meta-wrapper');
    expect(html).not.toContain('image-meta-badge');
  });
});
