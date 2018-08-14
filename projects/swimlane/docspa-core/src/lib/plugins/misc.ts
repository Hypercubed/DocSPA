import visit from 'unist-util-visit';
import mdAttrParser from 'md-attr-parser';
import remarkCustomBlocks from 'remark-custom-blocks';

// The list of DOM Event handler
const DOMEventHandler = [
  'onabort', 'onautocomplete', 'onautocompleteerror',
  'onblur', 'oncancel', 'oncanplay',
  'oncanplaythrough', 'onchange', 'onclick',
  'onclose', 'oncontextmenu', 'oncuechange',
  'ondblclick', 'ondrag', 'ondragend',
  'ondragenter', 'ondragexit', 'ondragleave',
  'ondragover', 'ondragstart', 'ondrop',
  'ondurationchange', 'onemptied', 'onended',
  'onerror', 'onfocus', 'oninput',
  'oninvalid', 'onkeydown', 'onkeypress',
  'onkeyup', 'onload', 'onloadeddata',
  'onloadedmetadata', 'onloadstart', 'onmousedown',
  'onmouseenter', 'onmouseleave', 'onmousemove',
  'onmouseout', 'onmouseover', 'onmouseup',
  'onmousewheel', 'onpause', 'onplay',
  'onplaying', 'onprogress', 'onratechange',
  'onreset', 'onresize', 'onscroll',
  'onseeked', 'onseeking', 'onselect',
  'onshow', 'onsort', 'onstalled',
  'onsubmit', 'onsuspend', 'ontimeupdate',
  'ontoggle', 'onvolumechange', 'onwaiting',
];

const isDangerous = p => DOMEventHandler.indexOf(p) >= 0;

export function infoString() {
  return function(tree) {
    visit(tree, 'code', node => {
      const idx = node.lang ? node.lang.search(/\s/) : -1;
      if (idx > -1) {
        const [lang, _infoString] = node.lang.slice(idx);
        node.infoString = node.lang.slice(idx);
        node.lang = node.lang.slice(0, idx);
      }
    });
  };
}

export function infoStringToAttr() {
  return function(tree) {
    visit(tree, 'code', node => {
      if (node.infoString) {
        const hProperties = mdAttrParser(node.infoString).prop;

        // Delete dangerous
        Object.getOwnPropertyNames(hProperties).forEach(p => {
          if (isDangerous(p)) {
            delete hProperties[p];
          }
        });

        node.data = Object.assign(node.data || {}, { hProperties });
      }
    });
  };
}

export const customBlocks = [remarkCustomBlocks, {
  example: {
    classes: 'example',
    title: 'optional'
  },
  note: {
    classes: 'notice note',
    title: 'optional'
  },
  info: {
    classes: 'notice info',
    title: 'optional'
  },
  tip: {
    classes: 'notice tip',
    title: 'optional'
  },
  warning: {
    classes: 'notice warn',
    title: 'optional'
  },
  figure: {
    classes: 'figure',
    title: 'optional'
  },
  caption: {
    classes: 'caption',
    title: 'optional'
  },
  spoiler: {
    classes: 'spoiler-block',
    title: 'optional',
    details: true
  },
  playground: {
    classes: 'playground',
    title: 'optional'
  },
  'note-badge': {
    classes: 'badge note',
    title: 'required'
  },
  tabs: {
    classes: 'tabs',
    title: 'optional'
  },
  tab: {
    classes: 'tab',
    title: 'optional'
  },
  grid: {
    classes: 'grid',
    title: 'optional'
  }
}];

export function tabsHook(hook, vm) {
  const toggleState = function(tabs) {
    tabs.forEach(tab => {
      const state = this === tab ? 'open' : 'closed';
      tab = tab.closest('.tab');
      tab.setAttribute('data-state', state);
    });
  };

  hook.doneEach(() => {
    [].slice.call(document.querySelectorAll('.tabs')).forEach(tabSet => {
      const tabs = [].slice.call(tabSet.querySelectorAll('.tabs .tab .custom-block-heading'));
      tabs.forEach((tab, i) => {
        const state = i === 0 ? 'open' : 'closed';
        tab.closest('.tab').setAttribute('data-state', state);
        tab.addEventListener('click', toggleState.bind(tab, tabs), false);
      });
    });
  });
}
