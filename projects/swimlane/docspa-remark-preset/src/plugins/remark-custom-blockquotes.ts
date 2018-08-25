// copy of https://github.com/montogeek/remark-custom-blockquotes with
// https://github.com/montogeek/remark-custom-blockquotes/pull/2 pending merge

import visit from 'unist-util-visit';

export function customBlockquotes({ mapping }) {
  return function transformer(tree) {
    visit(tree, 'paragraph', visitor);

    function visitor(node) {
      const { children } = node;
      const textNode = children[0].value;

      if (!textNode) {
        return;
      }

      const substr = textNode.substr(0, 2);
      const className = mapping[substr];

      if (className) {
        node.type = 'blockquote';
        node.data = {
          hName: 'blockquote',
          hProperties: {
            className
          }
        };

        const r = new RegExp(`^\\${substr}\\s`, 'gm');

        visit(node, 'text', function (cld) {
          cld.value = cld.value.replace(r, ' ');
        });
      }
    }
  };
}

export const customBlockquotesOptions = { mapping: {
  'i>': 'info',
  '!>': 'tip',
  '?>': 'warn',
  '->': 'box',
  '<>': 'box-left'
}};
