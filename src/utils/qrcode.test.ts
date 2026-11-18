import { describe, it, expect } from 'vitest';
import { buildQrMatrix, generateQrSvg, stripMarkdown } from './qrcode';

describe('buildQrMatrix', () => {
  it('selects appropriate matrix sizes across QR Versions 1 to 6', () => {
    expect(buildQrMatrix('https://ok.de').length).toBe(21); // V1 (13 bytes <= 17)
    expect(buildQrMatrix('https://ok-lab-karlsruhe.de').length).toBe(25); // V2 (27 bytes <= 32)
    expect(buildQrMatrix('https://ok-lab-karlsruhe.de/daten/baumbestand').length).toBe(29); // V3 (45 bytes <= 53)
    expect(
      buildQrMatrix('https://ok-lab-karlsruhe.de/projekte/karlsruhe-btw2017-stadtteile').length
    ).toBe(33); // V4 (65 bytes <= 78)
    expect(buildQrMatrix(`https://ok-lab-karlsruhe.de/${'a'.repeat(60)}`).length).toBe(37); // V5 (88 bytes <= 106)
    expect(buildQrMatrix(`https://ok-lab-karlsruhe.de/${'a'.repeat(90)}`).length).toBe(41); // V6 (118 bytes <= 134)
  });

  it('places valid 7x7 finder patterns, timing patterns, dark module, and format info (0x77C4)', () => {
    const matrix = buildQrMatrix('https://ok-lab-karlsruhe.de');
    const size = matrix.length;
    expect(size).toBe(25);

    // Top-left finder corners + center + white separator
    expect(matrix[0][0]).toBe(true);
    expect(matrix[0][6]).toBe(true);
    expect(matrix[6][0]).toBe(true);
    expect(matrix[3][3]).toBe(true);
    expect(matrix[1][1]).toBe(false);
    expect(matrix[7][7]).toBe(false);

    // Top-right and bottom-left finder centers
    expect(matrix[3][size - 4]).toBe(true);
    expect(matrix[size - 4][3]).toBe(true);

    // Timing pattern alternating at row 6 and col 6
    expect(matrix[6][8]).toBe(true);
    expect(matrix[6][9]).toBe(false);
    expect(matrix[8][6]).toBe(true);
    expect(matrix[9][6]).toBe(false);

    // Dark module at (4 * version + 9, 8) -> (17, 8) for Version 2
    expect(matrix[4 * 2 + 9][8]).toBe(true);

    // Top-left format copy matches 0x77C4 (MSB=1 at (8,0), LSB=0 at (0,8))
    expect(matrix[8][0]).toBe(true);
    expect(matrix[8][1]).toBe(true);
    expect(matrix[8][2]).toBe(true);
    expect(matrix[8][3]).toBe(false);
    expect(matrix[0][8]).toBe(false);
    expect(matrix[size - 1][8]).toBe(true);
    expect(matrix[8][size - 1]).toBe(false);
  });

  it('throws on input exceeding Version 6 byte capacity', () => {
    expect(() => buildQrMatrix('x'.repeat(135))).toThrow(/too long/i);
  });
});

describe('generateQrSvg', () => {
  it('renders crisp SVG markup with expected viewBox and modules path', () => {
    const svg = generateQrSvg('https://ok-lab-karlsruhe.de/events/odd26', { margin: 2 });
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 33 33"'); // V3 (29 + 2*2)
    expect(svg).toContain('shape-rendering="crispEdges"');
    expect(svg).toContain('<path d="M');
  });
});

describe('stripMarkdown', () => {
  it('strips headings, links, formatting, and images into compact plain text', () => {
    const md = `# Titel\n![Bild](/img.png)\nEin **Test** mit [Link](https://example.org) und \`Code\`.`;
    expect(stripMarkdown(md)).toBe('Ein Test mit Link und Code.');
  });
});
