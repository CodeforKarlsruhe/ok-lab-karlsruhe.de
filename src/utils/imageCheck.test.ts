import { describe, expect, it } from 'vitest';
import {
  evaluateImage,
  isIgnoredImagePath,
  parseImageDimensions,
} from '../../scripts/check-images.mjs';

function makePngHeader(width: number, height: number): Buffer {
  const buf = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.write('IHDR', 12, 'ascii');
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

function makeWebpVp8x(width: number, height: number): Buffer {
  const buf = Buffer.alloc(30);
  buf.write('RIFF', 0, 'ascii');
  buf.write('WEBP', 8, 'ascii');
  buf.write('VP8X', 12, 'ascii');
  buf.writeUIntLE(width - 1, 24, 3);
  buf.writeUIntLE(height - 1, 27, 3);
  return buf;
}

describe('check-images helpers', () => {
  it('ignores SVGs, favicons, vendor, fonts, and videos', () => {
    expect(isIgnoredImagePath('assets/images/okl.svg')).toBe(true);
    expect(isIgnoredImagePath('favicon.ico')).toBe(true);
    expect(isIgnoredImagePath('favicon-32x32.png')).toBe(true);
    expect(isIgnoredImagePath('assets/vendor/fullcalendar/icon.png')).toBe(true);
    expect(isIgnoredImagePath('assets/videos/blog/clip.mp4')).toBe(true);
    expect(isIgnoredImagePath('assets/images/projects/test/image.webp')).toBe(false);
    expect(isIgnoredImagePath('assets/images/projects/test/image.png')).toBe(false);
  });

  it('parses PNG and WebP VP8X dimensions', () => {
    expect(parseImageDimensions(makePngHeader(800, 600))).toEqual({
      format: 'png',
      width: 800,
      height: 600,
    });
    expect(parseImageDimensions(makeWebpVp8x(1920, 1080))).toEqual({
      format: 'webp',
      width: 1920,
      height: 1080,
    });
  });

  it('accepts compliant WebP within 1920x1080 and flags non-webp or oversized images', () => {
    expect(evaluateImage('public/assets/images/a.webp', makeWebpVp8x(1920, 1080)).issues).toEqual(
      []
    );

    expect(evaluateImage('public/assets/images/a.png', makePngHeader(640, 480)).issues).toEqual([
      'format is .png (expected .webp)',
    ]);

    expect(evaluateImage('public/assets/images/big.webp', makeWebpVp8x(2400, 1080)).issues).toEqual(
      ['dimensions 2400x1080 exceed max 1920x1080']
    );
  });
});
