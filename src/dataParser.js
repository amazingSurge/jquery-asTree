class DataParser {
  constructor(options) {
    this.tpl = options.tpl;
  }

  getLeaf(data) {
    const content = this.tpl.leaf(data);

    return `<li>${content}</li>`;
  }

  getBranch(data) {
    const content = this.tpl.branch(data);
    const children = this.getTree(data.children);

    return `<li class="tree-branch">${content}${children}</li>`;
  }

  getNode(data) {
    if (data.children) {
      return this.getBranch(data);
    }
    return this.getLeaf(data);
  }

  getTree(data, isRoot) {
    let output = '';
    for (const node of data) {
      output += this.getNode(node);
    }
    if (isRoot) {
      return `<ul class="tree">${output}</ul>`;
    }
    return `<ul>${output}</ul>`;
  }
}

export default DataParser;
