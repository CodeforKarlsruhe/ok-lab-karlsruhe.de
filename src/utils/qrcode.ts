interface QrVersionSpec {
  version: number;
  size: number;
  dataCodewords: number;
  ecCodewordsPerBlock: number;
  numBlocks: number;
  align: readonly number[];
}

// ISO/IEC 18004 Versions 1-6, Error Correction Level L (max 134 UTF-8 bytes in Byte mode)
const QR_VERSIONS_L: readonly QrVersionSpec[] = [
  { version: 1, size: 21, dataCodewords: 19, ecCodewordsPerBlock: 7, numBlocks: 1, align: [] },
  {
    version: 2,
    size: 25,
    dataCodewords: 34,
    ecCodewordsPerBlock: 10,
    numBlocks: 1,
    align: [6, 18],
  },
  {
    version: 3,
    size: 29,
    dataCodewords: 55,
    ecCodewordsPerBlock: 15,
    numBlocks: 1,
    align: [6, 22],
  },
  {
    version: 4,
    size: 33,
    dataCodewords: 80,
    ecCodewordsPerBlock: 20,
    numBlocks: 1,
    align: [6, 26],
  },
  {
    version: 5,
    size: 37,
    dataCodewords: 108,
    ecCodewordsPerBlock: 26,
    numBlocks: 1,
    align: [6, 30],
  },
  {
    version: 6,
    size: 41,
    dataCodewords: 136,
    ecCodewordsPerBlock: 18,
    numBlocks: 2,
    align: [6, 34],
  },
];

// Format information for ECC Level L (01) + Mask 0 (000), BCH-encoded & masked with 0x5412
const FORMAT_L_MASK_0 = 0x77c4;

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_EXP[i + 255] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsComputeEc(data: Uint8Array, ecCount: number): Uint8Array {
  let gen = [1];
  for (let i = 0; i < ecCount; i++) {
    const next = new Array<number>(gen.length + 1).fill(0);
    const root = GF_EXP[i];
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j];
      next[j + 1] ^= gfMul(gen[j], root);
    }
    gen = next;
  }

  const rem = new Uint8Array(ecCount);
  for (const byte of data) {
    const factor = byte ^ rem[0];
    rem.copyWithin(0, 1);
    rem[ecCount - 1] = 0;
    for (let j = 0; j < ecCount; j++) {
      rem[j] ^= gfMul(gen[j + 1], factor);
    }
  }
  return rem;
}

function encodeCodewords(bytes: Uint8Array, spec: QrVersionSpec): Uint8Array {
  const bitBuf: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bitBuf.push((val >> i) & 1);
    }
  };

  // Byte mode indicator (0100) + 8-bit character count (valid for V1-V6)
  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const b of bytes) pushBits(b, 8);

  const totalDataBits = spec.dataCodewords * 8;
  const termLen = Math.min(4, totalDataBits - bitBuf.length);
  pushBits(0, termLen);
  while (bitBuf.length % 8 !== 0) bitBuf.push(0);

  const dataBytes = new Uint8Array(spec.dataCodewords);
  for (let i = 0; i < bitBuf.length / 8; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bitBuf[i * 8 + b];
    dataBytes[i] = byte;
  }

  const padPattern = [0xec, 0x11];
  for (let i = bitBuf.length / 8, p = 0; i < spec.dataCodewords; i++, p ^= 1) {
    dataBytes[i] = padPattern[p];
  }

  const blockDataLen = Math.floor(spec.dataCodewords / spec.numBlocks);
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  for (let b = 0; b < spec.numBlocks; b++) {
    const slice = dataBytes.subarray(b * blockDataLen, (b + 1) * blockDataLen);
    dataBlocks.push(slice);
    ecBlocks.push(rsComputeEc(slice, spec.ecCodewordsPerBlock));
  }

  const result = new Uint8Array(spec.dataCodewords + spec.numBlocks * spec.ecCodewordsPerBlock);
  let out = 0;
  for (let i = 0; i < blockDataLen; i++) {
    for (const block of dataBlocks) result[out++] = block[i];
  }
  for (let i = 0; i < spec.ecCodewordsPerBlock; i++) {
    for (const block of ecBlocks) result[out++] = block[i];
  }
  return result;
}

/** Generate an ISO/IEC 18004 QR code matrix (Versions 1-6, ECC Level L, Mask 0). */
export function buildQrMatrix(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  const spec = QR_VERSIONS_L.find((v) => bytes.length + 2 <= v.dataCodewords);
  if (!spec) {
    throw new Error(
      `QR input too long (${bytes.length} bytes; max 134 bytes supported for Versions 1-6).`
    );
  }

  const { size, version, align } = spec;
  const grid = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array<boolean>(size).fill(false));

  const setReserved = (r: number, c: number, dark: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      grid[r][c] = dark;
      reserved[r][c] = true;
    }
  };

  // Finder patterns (7x7) + 1-module white separator
  for (const [top, left] of [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ]) {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const inFinder = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const onOuter = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setReserved(top + dr, left + dc, inFinder && (onOuter || inInner));
      }
    }
  }

  // Alignment patterns (5x5), skipping the three finder corners
  for (const rCenter of align) {
    for (const cCenter of align) {
      const overlapsFinder =
        (rCenter <= 8 && cCenter <= 8) ||
        (rCenter <= 8 && cCenter >= size - 8) ||
        (rCenter >= size - 8 && cCenter <= 8);
      if (overlapsFinder) continue;

      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dark = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
          setReserved(rCenter + dr, cCenter + dc, dark);
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setReserved(6, i, i % 2 === 0);
    setReserved(i, 6, i % 2 === 0);
  }

  // Dark module + format information copies (ECC L, Mask 0)
  setReserved(4 * version + 9, 8, true);

  const fmtBit = (bitIndex: number) => ((FORMAT_L_MASK_0 >> bitIndex) & 1) === 1;
  // Top-left copy: bits 14..9 at (8, 0..5), 8 at (8,7), 7 at (8,8), 6 at (7,8), 5..0 at (5..0, 8)
  for (let i = 0; i <= 5; i++) setReserved(8, i, fmtBit(14 - i));
  setReserved(8, 7, fmtBit(8));
  setReserved(8, 8, fmtBit(7));
  setReserved(7, 8, fmtBit(6));
  for (let i = 0; i <= 5; i++) setReserved(5 - i, 8, fmtBit(5 - i));

  // Bottom-left (14..8) & top-right (7..0) copies
  for (let i = 0; i < 7; i++) setReserved(size - 1 - i, 8, fmtBit(14 - i));
  for (let i = 0; i < 8; i++) setReserved(8, size - 8 + i, fmtBit(7 - i));

  // Place data + EC bits in standard zig-zag order and apply Mask 0: (r + c) % 2 === 0
  const codewords = encodeCodewords(bytes, spec);
  let bitIdx = 0;
  const totalBits = codewords.length * 8;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right--;
    for (let step = 0; step < size; step++) {
      const r = upward ? size - 1 - step : step;
      for (const c of [right, right - 1]) {
        if (reserved[r][c]) continue;
        let bit = false;
        if (bitIdx < totalBits) {
          bit = ((codewords[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1) === 1;
          bitIdx++;
        }
        grid[r][c] = (r + c) % 2 === 0 ? !bit : bit;
      }
    }
    upward = !upward;
  }

  return grid;
}

/** Generate a crisp, dependency-free SVG QR code for a URL or short string. */
export function generateQrSvg(text: string, options: { margin?: number } = {}): string {
  const margin = options.margin ?? 2;
  const matrix = buildQrMatrix(text);
  const size = matrix.length;
  const total = size + margin * 2;

  const pathParts: string[] = [];
  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) {
      if (!matrix[r][c]) {
        c++;
        continue;
      }
      const start = c;
      while (c < size && matrix[r][c]) c++;
      pathParts.push(`M${start + margin},${r + margin}h${c - start}v1h-${c - start}z`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" aria-hidden="true"><rect width="100%" height="100%" fill="#ffffff"/><path d="${pathParts.join('')}" fill="#1a1a1a"/></svg>`;
}

/** Strip basic Markdown formatting to produce plain text for compact print descriptions. */
export function stripMarkdown(md?: string): string {
  if (!md) return '';
  return md
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+.*$/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~>#|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
