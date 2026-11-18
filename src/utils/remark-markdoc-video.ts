interface MdastNode {
  type: string;
  value?: string;
  children?: MdastNode[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

const VIDEO_TAG_RE = /^\{%\s*video(?:\s+([\s\S]*?))?\s*\/%\}$/;
// Astro's built-in smartypants converts ASCII quotes to curly quotes before custom remark plugins run.
const ATTR_RE = /([a-zA-Z_][\w-]*)\s*=\s*(?:["“”]([^"“”]*)["“”]|['‘’]([^'‘’]*)['‘’]|(true|false))/g;

function getPlainText(node: MdastNode): string {
  if (typeof node.value === 'string') return node.value;
  if (!node.children) return '';
  return node.children.map(getPlainText).join('');
}

function parseAttributes(raw: string): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {};
  for (const match of raw.matchAll(ATTR_RE)) {
    const [, key, dq, sq, boolVal] = match;
    if (boolVal !== undefined) {
      attrs[key] = boolVal === 'true';
    } else {
      attrs[key] = dq ?? sq ?? '';
    }
  }
  return attrs;
}

function isSafeSrc(src: unknown): src is string {
  if (typeof src !== 'string') return false;
  const trimmed = src.trim();
  return trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://');
}

function makeVideoNode(rawAttrs: string): MdastNode | null {
  const attrs = parseAttributes(rawAttrs);
  if (!isSafeSrc(attrs.src)) return null;

  const autoplay = attrs.autoplay === true;
  const caption = typeof attrs.caption === 'string' ? attrs.caption.trim() : '';

  const hProperties: Record<string, unknown> = {
    src: attrs.src.trim(),
    preload: 'metadata',
    playsInline: true,
    ...(autoplay ? { autoPlay: true, loop: true, muted: true } : { controls: true }),
    ...(caption ? { dataCaption: caption, ariaLabel: caption } : {}),
  };

  return {
    type: 'markdocVideo',
    data: { hName: 'video', hProperties },
  };
}

function transformChildren(children: MdastNode[]): void {
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.type === 'paragraph' || node.type === 'text') {
      const match = getPlainText(node).trim().match(VIDEO_TAG_RE);
      if (match) {
        const videoNode = makeVideoNode(match[1] ?? '');
        if (videoNode) {
          children[i] = videoNode;
          continue;
        }
      }
    }
    if (node.children) {
      transformChildren(node.children);
    }
  }
}

export function remarkMarkdocVideo() {
  return (tree: MdastNode) => {
    if (tree.children) {
      transformChildren(tree.children);
    }
  };
}
