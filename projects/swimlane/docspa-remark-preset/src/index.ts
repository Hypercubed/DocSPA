import headings from '@rigor789/remark-autolink-headings';
import frontmatter from 'remark-frontmatter';
import math from 'remark-math';
import katex from 'remark-html-katex';
import gemojiToEmoji from 'remark-gemoji-to-emoji';
import htmlEmojiImage from 'remark-html-emoji-image';
import parseFrontmatter from 'remark-parse-yaml';
import shortcodes from 'remark-shortcodes';
import slug from 'remark-slug';
import remarkAttr from 'remark-attr';
import customBlocks from 'remark-custom-blocks';

import { readMatter, getTitle } from './plugins/frontmatter';
import { infoString, infoStringToAttr } from './plugins/misc';
import { customBlocksOptions } from './plugins/remark-custom-blocks';
import { customBlockquotes, customBlockquotesOptions } from './plugins/remark-custom-blockquotes';
import { shortCodeProps, tocSmartCode, customSmartCodes, customSmartCodesOptions } from './plugins/short-codes';
import { mermaid } from './plugins/mermaid';

export * from './plugins/mermaid';
export * from './plugins/prism';
export * from './plugins/runtime';

export const docspaRemarkPreset = [
  frontmatter,
  parseFrontmatter,
  readMatter,
  getTitle,
  infoString,
  [ remarkAttr, { scope: 'permissive' } ],
  slug,
  [ headings, { behaviour: 'append' } ],
  math,
  katex,
  gemojiToEmoji,
  [ htmlEmojiImage, { base: 'https://assets-cdn.github.com/images/icons/emoji/' }],
  infoStringToAttr,
  [ customBlocks, customBlocksOptions ],
  [ customBlockquotes, customBlockquotesOptions ],
  shortcodes,
  tocSmartCode,
  shortCodeProps,
  [ customSmartCodes, customSmartCodesOptions ]
];
