import { describe, expect, it } from 'vitest';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { remarkMarkdocTable } from './remark-markdoc-table';

async function renderMd(md: string): Promise<string> {
  const processor = await createMarkdownProcessor({
    remarkPlugins: [remarkMarkdocTable],
  });
  const result = await processor.render(md);
  return result.code;
}

describe('remarkMarkdocTable', () => {
  it('renders headerless markdoc image table (ka-kommunale-haushalte-bw pattern)', async () => {
    const md = [
      '### Screenshots',
      '',
      '{% table %}',
      '---',
      '- ![](/assets/images/projects/ka-kommunale-haushalte-bw/verwaltungsvorschrift.png)',
      '- ![](/assets/images/projects/ka-kommunale-haushalte-bw/repo.png)',
      '{% /table %}',
    ].join('\n');

    const html = await renderMd(md);

    expect(html).toContain('<table><tbody><tr>');
    expect(html).toContain(
      '<td><img src="/assets/images/projects/ka-kommunale-haushalte-bw/verwaltungsvorschrift.png" alt=""></td>'
    );
    expect(html).toContain(
      '<td><img src="/assets/images/projects/ka-kommunale-haushalte-bw/repo.png" alt=""></td>'
    );
    expect(html).not.toContain('<thead>');
    expect(html).not.toContain('{% table %}');
    expect(html).not.toContain('{% /table %}');
  });

  it('renders markdoc table with header row and multiple body rows', async () => {
    const md = [
      '{% table %}',
      '- Zeit',
      '- Titel',
      '---',
      '- 13:00',
      '- Begrüßung',
      '---',
      '- 13:10',
      '- Vorstellung',
      '{% /table %}',
    ].join('\n');

    const html = await renderMd(md);

    expect(html).toContain('<thead><tr><th>Zeit</th><th>Titel</th></tr></thead>');
    expect(html).toContain(
      '<tbody><tr><td>13:00</td><td>Begrüßung</td></tr><tr><td>13:10</td><td>Vorstellung</td></tr></tbody>'
    );
    expect(html).not.toContain('{% /table %}');
  });

  it('renders markdoc table with blank line before closing tag', async () => {
    const md = [
      '{% table %}',
      '',
      '---',
      '- ![A](/a.png)',
      '- ![B](/b.png)',
      '',
      '{% /table %}',
    ].join('\n');

    const html = await renderMd(md);

    expect(html).toContain(
      '<table><tbody><tr><td><img src="/a.png" alt="A"></td><td><img src="/b.png" alt="B"></td></tr></tbody></table>'
    );
  });

  it('leaves unclosed markdoc table untouched', async () => {
    const md = ['{% table %}', '---', '- ![A](/a.png)'].join('\n');

    const html = await renderMd(md);

    expect(html).not.toContain('<table>');
    expect(html).toContain('{% table %}');
  });
});
