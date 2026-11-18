import { describe, expect, it } from 'vitest';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { remarkMarkdocTable } from './remark-markdoc-table';
import { remarkMarkdocVideo } from './remark-markdoc-video';
import { rehypeMarkdownImageMeta } from './rehype-markdown-image-meta';

async function renderMd(md: string): Promise<string> {
  const processor = await createMarkdownProcessor({
    remarkPlugins: [remarkMarkdocTable, remarkMarkdocVideo],
    rehypePlugins: [rehypeMarkdownImageMeta],
  });
  const result = await processor.render(md);
  return result.code;
}

describe('remarkMarkdocVideo', () => {
  it('renders standard markdoc video with controls and caption tooltip', async () => {
    const html = await renderMd(
      '{% video src="/assets/videos/projects/demo.mp4" caption="Demo • © OK Lab" /%}'
    );

    expect(html).toContain('<span class="image-meta-wrapper">');
    expect(html).toContain('<video src="/assets/videos/projects/demo.mp4"');
    expect(html).toContain('controls');
    expect(html).toContain('playsinline');
    expect(html).toContain('preload="metadata"');
    expect(html).toContain('<span class="meta-text">Demo • © OK Lab</span>');
  });

  it('renders autoplay loop muted video without controls when autoplay=true', async () => {
    const html = await renderMd(
      '{% video src="/assets/videos/projects/loop.webm" autoplay=true /%}'
    );

    expect(html).toContain('<video src="/assets/videos/projects/loop.webm"');
    expect(html).toContain('autoplay');
    expect(html).toContain('loop');
    expect(html).toContain('muted');
    expect(html).not.toContain('controls');
    expect(html).not.toContain('image-meta-wrapper');
  });

  it('renders video inside a markdoc table cell', async () => {
    const md = [
      '{% table %}',
      '---',
      '- {% video src="/assets/videos/projects/a.mp4" /%}',
      '- ![Screenshot](/assets/images/projects/b.png)',
      '{% /table %}',
    ].join('\n');

    const html = await renderMd(md);

    expect(html).toContain('<td><video src="/assets/videos/projects/a.mp4"');
    expect(html).toContain(
      '<td><span class="image-meta-wrapper"><img src="/assets/images/projects/b.png" alt="Screenshot">'
    );
  });

  it('ignores unsafe src schemes', async () => {
    const html = await renderMd('{% video src="javascript:alert(1)" /%}');

    expect(html).not.toContain('<video');
  });
});
