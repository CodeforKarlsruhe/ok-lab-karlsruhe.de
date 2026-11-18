import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const MAX_WIDTH = 1920;
export const MAX_HEIGHT = 1080;

const RASTER_EXTS = new Set(['.webp', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.avif']);
const IGNORED_DIRS = new Set(['vendor', 'fonts', 'videos']);

export function isIgnoredImagePath(relPath) {
  const normalized = relPath.replace(/\\/g, '/');
  const parts = normalized.split('/');
  if (parts.some((p) => IGNORED_DIRS.has(p))) return true;
  const base = path.posix.basename(normalized).toLowerCase();
  const ext = path.posix.extname(base);
  if (ext === '.svg' || ext === '.ico') return true;
  if (base.startsWith('favicon') || base.startsWith('apple-touch-icon')) return true;
  return !RASTER_EXTS.has(ext);
}

/** Read width and height from PNG, WebP, GIF, or JPEG header bytes. */
export function parseImageDimensions(buf) {
  if (buf.length < 12) return null;

  // PNG
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    if (buf.length < 24) return null;
    return { format: 'png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // GIF
  const head6 = buf.subarray(0, 6).toString('ascii');
  if (head6 === 'GIF87a' || head6 === 'GIF89a') {
    return { format: 'gif', width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }

  // WebP
  if (
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    const chunk = buf.subarray(12, 16).toString('ascii');
    if (chunk === 'VP8 ' && buf.length >= 30) {
      return {
        format: 'webp',
        width: buf.readUInt16LE(26) & 0x3fff,
        height: buf.readUInt16LE(28) & 0x3fff,
      };
    }
    if (chunk === 'VP8L' && buf.length >= 25) {
      const b = buf.readUInt32LE(21);
      return {
        format: 'webp',
        width: (b & 0x3fff) + 1,
        height: ((b >> 14) & 0x3fff) + 1,
      };
    }
    if (chunk === 'VP8X' && buf.length >= 30) {
      return {
        format: 'webp',
        width: buf.readUIntLE(24, 3) + 1,
        height: buf.readUIntLE(27, 3) + 1,
      };
    }
  }

  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 4 < buf.length) {
      if (buf[offset] !== 0xff) {
        offset++;
        continue;
      }
      while (offset < buf.length && buf[offset] === 0xff) offset++;
      if (offset >= buf.length) break;
      const marker = buf[offset];
      offset++;
      if (
        marker === 0xd8 ||
        marker === 0xd9 ||
        marker === 0x01 ||
        (marker >= 0xd0 && marker <= 0xd7)
      ) {
        continue;
      }
      if (offset + 2 > buf.length) break;
      const segLen = buf.readUInt16BE(offset);
      const isSof =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSof && offset + 7 <= buf.length) {
        return {
          format: 'jpeg',
          height: buf.readUInt16BE(offset + 3),
          width: buf.readUInt16BE(offset + 5),
        };
      }
      if (segLen < 2) break;
      offset += segLen;
    }
  }

  return null;
}

export function evaluateImage(relPath, buf) {
  const ext = path.posix.extname(relPath).toLowerCase();
  const dims = parseImageDimensions(buf);
  const issues = [];

  if (ext !== '.webp') {
    issues.push(`format is ${ext} (expected .webp)`);
  } else if (dims && dims.format !== 'webp') {
    issues.push(`file content is ${dims.format} despite .webp extension`);
  }

  if (!dims) {
    issues.push('could not read image dimensions');
  } else if (dims.width > MAX_WIDTH || dims.height > MAX_HEIGHT) {
    issues.push(`dimensions ${dims.width}x${dims.height} exceed max ${MAX_WIDTH}x${MAX_HEIGHT}`);
  }

  return { relPath, dims, issues };
}

function walkFiles(dir, baseDir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(abs, baseDir, out);
    } else {
      const rel = path.relative(baseDir, abs).replace(/\\/g, '/');
      if (!isIgnoredImagePath(rel)) out.push({ abs, rel });
    }
  }
  return out;
}

function convertImageToWebp(srcAbs, destAbs) {
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      srcAbs,
      '-vf',
      `scale='min(${MAX_WIDTH},iw)':'min(${MAX_HEIGHT},ih)':force_original_aspect_ratio=decrease`,
      '-c:v',
      'libwebp',
      '-quality',
      '82',
      destAbs,
    ],
    { stdio: 'pipe' }
  );
}

function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--output-dir');
  const outputDir = outIdx !== -1 ? args[outIdx + 1] : null;
  const strict = args.includes('--strict');

  const publicDir = path.resolve('public');
  const files = walkFiles(publicDir, publicDir);
  const findings = [];

  for (const { abs, rel } of files) {
    const buf = fs.readFileSync(abs);
    const res = evaluateImage(`public/${rel}`, buf);
    if (res.issues.length > 0) {
      findings.push({ ...res, abs, relPublic: rel });
    }
  }

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `has_warnings=${findings.length > 0 ? 'true' : 'false'}\n`
    );
  }

  if (findings.length === 0) {
    console.log(
      `Checked ${files.length} images: all compliant (WebP, <= ${MAX_WIDTH}x${MAX_HEIGHT}).`
    );
    return;
  }

  for (const item of findings) {
    const msg = `${item.relPath}: ${item.issues.join('; ')}`;
    if (process.env.GITHUB_ACTIONS) {
      console.log(
        `::warning file=${item.relPath}::${item.issues.join('; ')}. Converted WebP available in build artifacts.`
      );
    } else {
      console.warn(`WARNING: ${msg}`);
    }

    if (outputDir) {
      const targetRel = item.relPublic.replace(/\.[^.]+$/, '.webp');
      const destAbs = path.resolve(outputDir, targetRel);
      convertImageToWebp(item.abs, destAbs);
      console.log(`  -> wrote compliant WebP: ${path.relative(process.cwd(), destAbs)}`);
    }
  }

  if (strict) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
