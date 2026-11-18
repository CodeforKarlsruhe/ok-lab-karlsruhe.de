interface HastElement {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastElement[];
}

const SKIP_ANCESTORS = new Set(['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

function isSvgSrc(src: unknown): boolean {
  if (typeof src !== 'string') return false;
  return src.split('?')[0].split('#')[0].toLowerCase().trim().endsWith('.svg');
}

function el(
  tagName: string,
  properties: Record<string, unknown>,
  children: HastElement[] = []
): HastElement {
  return { type: 'element', tagName, properties, children };
}

function createMetaBadge(altText: string): HastElement {
  const icon = el(
    'svg',
    {
      width: '14',
      height: '14',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2.5',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ariaHidden: 'true',
    },
    [
      el('circle', { cx: '12', cy: '12', r: '10' }),
      el('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
      el('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' }),
    ]
  );

  const button = el(
    'button',
    {
      type: 'button',
      className: ['image-meta-btn'],
      ariaLabel: 'Bildinformationen und Urheberrechte',
      title: 'Bildinformationen',
      ariaExpanded: 'false',
    },
    [icon]
  );

  const popover = el('span', { className: ['image-meta-popover'], role: 'tooltip' }, [
    el('span', { className: ['meta-row'] }, [
      el('span', { className: ['meta-icon'], ariaHidden: 'true' }, [{ type: 'text', value: 'ℹ️' }]),
      el('span', { className: ['meta-text'] }, [{ type: 'text', value: altText }]),
    ]),
  ]);

  return el('span', { className: ['image-meta-badge', 'pos-bottom-right'] }, [button, popover]);
}

function visitChildren(children: HastElement[], insideSkippedAncestor: boolean): void {
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.type !== 'element') continue;

    if (node.tagName === 'img' || node.tagName === 'video') {
      const metaText =
        node.tagName === 'img'
          ? typeof node.properties?.alt === 'string'
            ? node.properties.alt.trim()
            : ''
          : typeof node.properties?.dataCaption === 'string'
            ? node.properties.dataCaption.trim()
            : '';
      const src = node.properties?.src;
      if (!insideSkippedAncestor && metaText && (node.tagName === 'video' || !isSvgSrc(src))) {
        children[i] = el('span', { className: ['image-meta-wrapper'] }, [
          node,
          createMetaBadge(metaText),
        ]);
      }
      continue;
    }

    if (node.children) {
      const skip = insideSkippedAncestor || SKIP_ANCESTORS.has(node.tagName ?? '');
      visitChildren(node.children, skip);
    }
  }
}

export function rehypeMarkdownImageMeta() {
  return (tree: HastElement) => {
    if (tree.children) {
      visitChildren(tree.children, false);
    }
  };
}
