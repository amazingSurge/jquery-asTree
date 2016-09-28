class Node {
  constructor($dom, isRoot, api) {
    this.$dom = $dom;
    this.api = api;

    if (isRoot === null) {
      isRoot = false;
    }

    if (isRoot) {
      this.type = 'root';
    } else {
      this.selected = false;
      if (this.hasChildren()) {
        this.type = 'branch';
        this.opened = this.isOpened();
      } else {
        this.type = 'leaf';
      }
    }
    this.init();

  }

  init() {
    switch (this.type) {
      case 'root': {
        this._children = this.$dom.get(0).children;
        this.level = 0;
        this.parent = null;
        this.$parent = null;
        break;
      }
      case 'branch':
      case 'leaf': {
        const childrenUl = this.$dom.children('ul');
        if (childrenUl.length > 0) {
          this._children = childrenUl.get(0).children;
        } else {
          this._children = [];
        }

        this.$parent = this.$dom.parents('li.tree-branch').eq(0);

        if (this.$parent.length === 0) {
          this.$parent = this.$dom.parent();
        }

        this.parent = this.$parent.data('node');
        this.level = this.parent.level + 1;
        break;
      }
      default: {
        break;
      }
    }
  }

  // Retrieve the DOM elements matched by the Node object.
  get() {
    return this.$dom;
  }

  position() {
    const postions = [];

    const _iterate = node => {
      postions.push(node.$dom.index() + 1);
      if (node.parent && node.parent.type !== 'root') {
        _iterate(node.parent);
      }
    };
    _iterate(this);

    return postions.reverse();
  }

  parents() {
    const parents = [];

    const _iterate = node => {
      if (node.parent !== null) {
        parents.push(node.parent);
        _iterate(node.parent);
      }
    };
    _iterate(this);
    return parents;
  }

  children() {
    const children = [];
    let node;
    for (let i = 0; i < this._children.length; i++) {
      node = $(this._children[i]).data('node');
      if (node) {
        children.push(node);
      }
    }

    return children;
  }

  siblings() {
    const siblings = [];
    const $siblings = this.$dom.siblings();
    let node;

    for (let i = 0; i < $siblings.length; i++) {
      node = $siblings.data('node');
      if (node) {
        siblings.push(node);
      }
    }
    return siblings;
  }

  hasChildren() {
    return this.$dom.children('ul').children('li').length !== 0;
  }

  isOpened() {
    if (typeof this.opened === 'undefined') {
      return this.$dom.is('.tree_open');
    }
    return this.opened;
  }

  open(iterate) {
    this.opened = true;
    this.$dom.addClass('tree_open');

    // open parents nodes
    if (iterate) {
      const parents = this.parents();
      for (let i = 0; i < parents.length; i++) {
        if (parents[i].type !== 'root') {
          parents[i].open();
        }
      }
    }

    if (!this.api.options.multiSelect && this.hasChildrenSelect()) {
      this.$dom.removeClass('tree_childrenSelected');
    }

    return this;
  }

  close(iterate) {
    this.opened = false;
    this.$dom.removeClass('tree_open');

    // close children nodes
    if (iterate) {
      const children = this.children();
      for (let i = 0; i < children.length; i++) {
        if (children[i].type === 'branch') {
          children[i].close(true);
        }
      }
    }

    if (!this.api.options.multiSelect && this.hasChildrenSelect()) {
      this.$dom.addClass('tree_childrenSelected');
    }

    return this;
  }

  hasChildrenSelect() {
    return this.$dom.find('li.tree_selected').length !== 0;
  }

  hasChildrenSelectBranch() {
    return this.api.$element.find('li.tree_childrenSelected').length !== 0;
  }

  toggleOpen() {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
    return this;
  }

  toggleSelect() {
    if (this.selected) {
      this.unselect();
    } else {
      this.select();
    }

    return this;
  }

  select() {
    this.selected = true;
    this.$dom.addClass('tree_selected');
    if (this.api.options.multiSelect) {
      this.api.selected.push(this);
    } else {
      if (this.api.selected) {
        this.api.selected.unselect(true);
      }
      this.api.selected = this;
    }

    if (!this.api.options.multiSelect && this.hasChildrenSelectBranch()) {
      this.api.$element.find('li.tree_childrenSelected').removeClass('tree_childrenSelected');
    }

    return this;
  }

  unselect(force) {
    if (this.api.options.canUnselect || force) {
      this.selected = false;
      this.$dom.removeClass('tree_selected');

      if (this.api.options.multiSelect) {
        this.api.selected = $.grep(this.api.selected, node => node.$dom !== this.$dom);
      } else {
        this.api.selected = null;
      }
    }
    return this;
  }

  toBranch() {
    if (this.type === 'leaf') {
      const content = this.$dom.html();
      this.$dom.addClass('tree-branch');
      this.$dom.html(`${this.api.options.tpl.branch(content)}<ul></ul>`);
    }
    return this;
  }

  append(data) {
    if (this.type === 'leaf') {
      this.toBranch();
    }

    const html = this.api.dataParser.getNode(data);
    const $node = $(html).appendTo(this.$dom.children('ul'));

    if (this.type === 'leaf') {
      this.api.attach(this.$dom, false, this.api);
    } else {
      this.api.attach($node, false, this.api);
    }

    return this;
  }

  prepend(data) {
    if (this.type === 'leaf') {
      this.toBranch();
    }

    const html = this.api.dataParser.getNode(data);
    const $node = $(html).prependTo(this.$dom.children('ul'));

    if (this.type === 'leaf') {
      this.api.attach(this.$dom, false, this.api);
    } else {
      this.api.attach($node, false, this.api);
    }

    return this;
  }

  after(data) {
    const html = this.api.dataParser.getNode(data);
    this.$dom.after(html);

    const $node = this.$dom.next();
    this.api.attach($node, false, this.api);
    return this;
  }

  before(data) {
    const html = this.api.dataParser.getNode(data);
    this.$dom.before(html);

    const $node = this.$dom.prev();
    this.api.attach($node, false, this.api);
    return this;
  }

  remove() {
    this.$dom.remove();

    return this;
  }
}

export default Node;
