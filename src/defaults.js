/*eslint no-unused-vars: "off"*/

export default {
  namespace: 'tree',
  autoOpen: [1, 2], //true/false/1/2...
  // keyboard: false, // Support keyboard navigation.
  dataFromHtml: false,
  data: null,
  multiSelect: false,
  canUnselect: true,

  tpl: {
    toggler(node) {
      return '<i class="tree-toggler"></i>';
    },
    branch(node) {
      const content = this.branchContent(node);
      const toggler = this.toggler(node);
      return `<div class="tree-element">${toggler}<div class="element-content">${content}</div></div>`;
    },
    branchContent(node) {
      if (typeof(node) === 'object') {
        return node.name;
      }
      return node;
    },
    leaf(node) {
      const content = this.leafContent(node);

      return content;
    },
    leafContent(node) {
      if (typeof node === 'object') {
        return node.name;
      }
      return node;
    }
  }
};
