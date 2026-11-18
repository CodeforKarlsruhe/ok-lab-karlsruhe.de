interface MdastNode {
  type: string;
  depth?: number;
  value?: string;
  children?: MdastNode[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

const OPEN_TAG_RE = /^\{%\s*table\s*%\}$/;
const CLOSE_TAG_RE = /^\{%\s*\/table\s*%\}$/;
const TRAILING_CLOSE_TAG_RE = /\s*\{%\s*\/table\s*%\}\s*$/;

function getPlainText(node: MdastNode): string {
  if (typeof node.value === 'string') return node.value;
  if (!node.children) return '';
  return node.children.map(getPlainText).join('');
}

function isOpenTag(node: MdastNode): boolean {
  if (node.type !== 'paragraph' && !(node.type === 'heading' && node.depth === 2)) {
    return false;
  }
  return OPEN_TAG_RE.test(getPlainText(node).trim());
}

function isCloseTag(node: MdastNode): boolean {
  return node.type === 'paragraph' && CLOSE_TAG_RE.test(getPlainText(node).trim());
}

function listEndsWithCloseTag(listNode: MdastNode): boolean {
  const lastItem = listNode.children?.[listNode.children.length - 1];
  if (!lastItem) return false;
  return TRAILING_CLOSE_TAG_RE.test(getPlainText(lastItem));
}

function stripTrailingCloseTag(node: MdastNode): boolean {
  if (typeof node.value === 'string') {
    if (!TRAILING_CLOSE_TAG_RE.test(node.value)) return false;
    node.value = node.value.replace(TRAILING_CLOSE_TAG_RE, '');
    return true;
  }
  if (!node.children || node.children.length === 0) return false;
  const last = node.children[node.children.length - 1];
  const stripped = stripTrailingCloseTag(last);
  if (stripped && typeof last.value === 'string' && last.value === '') {
    node.children.pop();
  } else if (stripped && last.type === 'paragraph' && last.children?.length === 0) {
    node.children.pop();
  }
  return stripped;
}

function makeCell(listItem: MdastNode, tagName: 'th' | 'td'): MdastNode {
  const children =
    listItem.children?.length === 1 && listItem.children[0].type === 'paragraph'
      ? (listItem.children[0].children ?? [])
      : (listItem.children ?? []);
  return {
    type: 'markdocTableCell',
    data: { hName: tagName },
    children,
  };
}

function makeRow(listNode: MdastNode, cellTag: 'th' | 'td'): MdastNode {
  return {
    type: 'markdocTableRow',
    data: { hName: 'tr' },
    children: (listNode.children ?? []).map((item) => makeCell(item, cellTag)),
  };
}

function transformChildren(children: MdastNode[]): void {
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (!isOpenTag(node)) {
      if (node.children) transformChildren(node.children);
      continue;
    }

    // Setext heading `{% table %}\n---` already consumed the header separator, so no header row.
    const hasHeader = node.type === 'paragraph' && children[i + 1]?.type === 'list';
    const rows: MdastNode[] = [];
    let endIndex = -1;
    let aborted = false;

    for (let j = i + 1; j < children.length; j++) {
      const curr = children[j];
      if (isCloseTag(curr)) {
        endIndex = j;
        break;
      }
      if (curr.type === 'thematicBreak') {
        continue;
      }
      if (curr.type === 'list') {
        rows.push(curr);
        if (listEndsWithCloseTag(curr)) {
          endIndex = j;
          break;
        }
        continue;
      }
      aborted = true;
      break;
    }

    if (aborted || endIndex === -1 || rows.length === 0) {
      continue;
    }

    stripTrailingCloseTag(rows[rows.length - 1]);

    const tableSections: MdastNode[] = [];
    if (hasHeader) {
      tableSections.push({
        type: 'markdocTableHead',
        data: { hName: 'thead' },
        children: [makeRow(rows[0], 'th')],
      });
    }
    const bodyRows = hasHeader ? rows.slice(1) : rows;
    if (bodyRows.length > 0) {
      tableSections.push({
        type: 'markdocTableBody',
        data: { hName: 'tbody' },
        children: bodyRows.map((row) => makeRow(row, 'td')),
      });
    }

    const tableNode: MdastNode = {
      type: 'markdocTable',
      data: { hName: 'table' },
      children: tableSections,
    };

    children.splice(i, endIndex - i + 1, tableNode);
  }
}

export function remarkMarkdocTable() {
  return (tree: MdastNode) => {
    if (tree.children) {
      transformChildren(tree.children);
    }
  };
}
