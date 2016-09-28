import $ from 'jquery';
import DEFAULTS from './defaults';
import DataParser from './dataParser';
import Node from './node';
import HtmlParser from './htmlParser';

const NAMESPACE = 'asTree';

/**
 * Plugin constructor
 **/
class asTree {
  constructor(element, options) {
    this.$element = $(element);
    this.options = $.extend(true, {}, DEFAULTS, options);
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
      click: $.proxy(this._click, this)
    });

    this._trigger('ready');
  }

  _trigger(eventType, ...params) {
    let data = [this].concat(...params);

    // event
    this.$element.trigger(`${NAMESPACE}::${eventType}`, data);

    // callback
    eventType = eventType.replace(/\b\w+\b/g, (word) => {
      return word.substring(0, 1).toUpperCase() + word.substring(1);
    });
    let onFunction = `on${eventType}`;

    if (typeof this.options[onFunction] === 'function') {
      this.options[onFunction].apply(this, ...params);
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
    const $target = $(e.target).closest('.tree-toggler, li');
    const $node = $(e.target).closest('li');
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
          const $node = $(node);
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
    if (!$.isArray(position)) {
      position = [];
    }

    try {
      const _iterate = (_node, index) => $(_node._children[index]).data('node');

      let node = this.root;
      for (let i = 0; i < position.length; i++) {
        node = _iterate(node, position[i] - 1)
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
          const $node = $(item);
          const node = $node.data('node');
          if (this.options.autoOpen === true && node.type === 'branch') {
            node.open();
          }
        });
        break;
      }
      case 'number': {
        $root.find('li').each((i, item) => {
          const $node = $(item);
          const node = $node.data('node');
          if (node.type === 'branch' && node.level <= this.options.autoOpen) {
            node.open();
          }
        });
        break;
      }
      case 'object': {
        if ($.isArray(this.options.autoOpen)) {
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
    $.extend(DEFAULTS, $.isPlainObject(options) && options);
  }
}

export default asTree;
