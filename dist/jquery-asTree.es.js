/**
* jQuery asTree v0.3.2
* https://github.com/amazingSurge/jquery-asTree
*
* Copyright (c) amazingSurge
* Released under the LGPL-3.0 license
*/
import $$1 from 'jquery';

/*eslint no-unused-vars: "off"*/

var DEFAULTS = {
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

class HtmlParser {
  constructor(options) {
    this.tpl = options.tpl;
  }

  getLeaf($node) {
    return $node.html();
  }

  getBranch($node) {
    return $node.children('div').html();
  }

  renderTree($node, isRoot, api) {
    let $children;

    if (isRoot) {
      $children = $node;
      $node.addClass('tree');
    } else {
      $children = $node.children('ul');
    }

    if ($children.length !== 0) { // has child
      $node.addClass('tree-branch');

      const _iterate = $tree => {
        $tree.children('li').each((i, node) => {
          const $node = $(node);
          const html = this.tpl.branch(this.getBranch($node));

          $node.children('div').replaceWith(html);

          this.renderTree($node, false, api);
        });
      };
      _iterate($children);
    }
  }
}

const NAMESPACE$1 = 'asTree';

/**
 * Plugin constructor
 **/
class asTree {
  constructor(element, options = {}) {
    this.$element = $$1(element);
    this.options = $$1.extend(true, {}, DEFAULTS, options);
    this.namespace = this.options.namespace;
    this.dataParser = new DataParser(this.options);
    this.htmlParser = new HtmlParser(this.options);

    this._init();
  }

  _init() {
    if (this.options.dataFromHtml === true) {
      this._createFromHtml();
    } else {
      this._createFromData();
    }

    const $root = (this.$element[0].nodeName.toLowerCase() === 'ul' ? this.$element : this.$element.find('ul:first'));
    this.root = $root.data('node');

    if (this.options.multiSelect) {
      this.selected = [];
    } else {
      this.selected = null;
    }

    this.autoOpen();

    // Bind events
    this.$element.on({
      click: $$1.proxy(this._click, this)
    });

    this._trigger('ready');
  }

  _trigger(eventType, ...params) {
    let data = [this].concat(params);

    // event
    this.$element.trigger(`${NAMESPACE$1}::${eventType}`, data);

    // callback
    eventType = eventType.replace(/\b\w+\b/g, (word) => {
      return word.substring(0, 1).toUpperCase() + word.substring(1);
    });
    let onFunction = `on${eventType}`;

    if (typeof this.options[onFunction] === 'function') {
      this.options[onFunction].apply(this, params);
    }
  }

  _createFromHtml() {
    const $tree = (this.$element[0].nodeName.toLowerCase() === 'ul' ? this.$element : this.$element.find('ul:first'));

    this.htmlParser.renderTree($tree, true, this);
    this.attach($tree, true, this);
  }

  _createFromData() {
    let html = '';
    if (this.options.data) {
      html = this.dataParser.getTree(this.options.data, true);
    }
    this.$element.html(html);
    this.attach(this.$element.children('ul'), true, this);
  }

  _click(e) {
    const $target = $$1(e.target).closest('.tree-toggler, li');
    const $node = $$1(e.target).closest('li');
    const node = $node.data('node');

    switch ($target.attr('class')) {
      case 'tree-toggler':
        node.toggleOpen();
        break;
      default:
        node.toggleSelect();
        break;
    }
  }

  attach($node, isRoot, api) {
    $node.data('node', new Node($node, isRoot, api));

    let $children;
    if (isRoot) {
      $children = $node;
    } else {
      $children = $node.children('ul');
    }

    if ($children.length !== 0) { // has child
      const _iterate = $tree => {
        $tree.children('li').each((i, node) => {
          const $node = $$1(node);
          this.attach($node, false, api);
        });
      };
      _iterate($children);
    }
  }

  open(position, iterate) {
    const node = this.get(position);
    if (node) {
      node.open(iterate);
    }
    return this;
  }

  close(position, iterate) {
    const node = this.get(position);
    if (node) {
      node.close(iterate);
    }
    return this;
  }

  select(position) {
    const node = this.get(position);
    if (node) {
      node.select();
    }
    return this;
  }

  unselect(position) {
    const node = this.get(position);
    if (node) {
      node.unselect();
    }
    return this;
  }

  get(position) {
    if (!$$1.isArray(position)) {
      position = [];
    }

    try {
      const _iterate = (_node, index) => $$1(_node._children[index]).data('node');

      let node = this.root;
      for (let i = 0; i < position.length; i++) {
        node = _iterate(node, position[i] - 1);
      }
      return node;

    } catch (e) {
      return null;
    }
  }

  getRoot() {
    return this.root;
  }

  getSelected() {
    return this.selected;
  }

  autoOpen() {
    const $root = this.root.$dom;

    switch (typeof this.options.autoOpen) {
      case 'boolean': {
        $root.find('li').each((i, item) => {
          const $node = $$1(item);
          const node = $node.data('node');
          if (this.options.autoOpen === true && node.type === 'branch') {
            node.open();
          }
        });
        break;
      }
      case 'number': {
        $root.find('li').each((i, item) => {
          const $node = $$1(item);
          const node = $node.data('node');
          if (node.type === 'branch' && node.level <= this.options.autoOpen) {
            node.open();
          }
        });
        break;
      }
      case 'object': {
        if ($$1.isArray(this.options.autoOpen)) {
          this.get(this.options.autoOpen).open(true);
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  append(position, data) {
    const node = this.get(position);
    if (node) {
      node.append(data);
    }
    return this;
  }

  prepend(position, data) {
    const node = this.get(position);
    if (node) {
      node.prepend(data);
    }
    return this;
  }

  after(position, data) {
    const node = this.get(position);
    if (node) {
      node.after(data);
    }
    return this;
  }

  before(position, data) {
    const node = this.get(position);
    if (node) {
      node.before(data);
    }
    return this;
  }

  remove(position) {
    const node = this.get(position);
    if (node) {
      node.remove();
    }
    return this;
  }

  static setDefaults(options) {
    $$1.extend(true, DEFAULTS, $$1.isPlainObject(options) && options);
  }
}

var info = {
  version:'0.3.2'
};

const NAMESPACE = 'asTree';
const OtherAsTree = $$1.fn.asTree;

const jQueryAsTree = function(options, ...args) {
  if (typeof options === 'string') {
    const method = options;

    if (/^_/.test(method)) {
      return false;
    } else if ((/^(get)/.test(method))) {
      const instance = this.first().data(NAMESPACE);
      if (instance && typeof instance[method] === 'function') {
        return instance[method](...args);
      }
    } else {
      return this.each(function() {
        const instance = $$1.data(this, NAMESPACE);
        if (instance && typeof instance[method] === 'function') {
          instance[method](...args);
        }
      });
    }
  }

  return this.each(function() {
    if (!$$1(this).data(NAMESPACE)) {
      $$1(this).data(NAMESPACE, new asTree(this, options));
    }
  });
};

$$1.fn.asTree = jQueryAsTree;

$$1.asTree = $$1.extend({
  setDefaults: asTree.setDefaults,
  noConflict: function() {
    $$1.fn.asTree = OtherAsTree;
    return jQueryAsTree;
  }
}, info);
