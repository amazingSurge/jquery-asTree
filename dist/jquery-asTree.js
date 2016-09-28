/**
* jQuery asTree v0.3.0
* https://github.com/amazingSurge/jquery-asTree
*
* Copyright (c) amazingSurge
* Released under the LGPL-3.0 license
*/
(function(global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports !== "undefined") {
    factory(require('jquery'));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.jQuery);
    global.jqueryAsTreeEs = mod.exports;
  }
})(this,

  function(_jquery) {
    'use strict';

    var _jquery2 = _interopRequireDefault(_jquery);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;

          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);

        if (staticProps)
          defineProperties(Constructor, staticProps);

        return Constructor;
      };
    }();

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ?

      function(obj) {
        return typeof obj;
      }
      :

      function(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
      };

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
        toggler: function toggler(node) {
          return '<i class="tree-toggler"></i>';
        },
        branch: function branch(node) {
          var content = this.branchContent(node);
          var toggler = this.toggler(node);

          return '<div class="tree-element">' + toggler + '<div class="element-content">' + content + '</div></div>';
        },
        branchContent: function branchContent(node) {
          if ((typeof node === 'undefined' ? 'undefined' : _typeof(node)) === 'object') {

            return node.name;
          }

          return node;
        },
        leaf: function leaf(node) {
          var content = this.leafContent(node);

          return content;
        },
        leafContent: function leafContent(node) {
          if ((typeof node === 'undefined' ? 'undefined' : _typeof(node)) === 'object') {

            return node.name;
          }

          return node;
        }
      }
    };

    var DataParser = function() {
      function DataParser(options) {
        _classCallCheck(this, DataParser);

        this.tpl = options.tpl;
      }

      _createClass(DataParser, [{
        key: 'getLeaf',
        value: function getLeaf(data) {
          var content = this.tpl.leaf(data);

          return '<li>' + content + '</li>';
        }
      }, {
        key: 'getBranch',
        value: function getBranch(data) {
          var content = this.tpl.branch(data);
          var children = this.getTree(data.children);

          return '<li class="tree-branch">' + content + children + '</li>';
        }
      }, {
        key: 'getNode',
        value: function getNode(data) {
          if (data.children) {

            return this.getBranch(data);
          }

          return this.getLeaf(data);
        }
      }, {
        key: 'getTree',
        value: function getTree(data, isRoot) {
          var output = '';
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {

            for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var node = _step.value;

              output += this.getNode(node);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {

              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {

              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          if (isRoot) {

            return '<ul class="tree">' + output + '</ul>';
          }

          return '<ul>' + output + '</ul>';
        }
      }]);

      return DataParser;
    }();

    var Node = function() {
      function Node($dom, isRoot, api) {
        _classCallCheck(this, Node);

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

      _createClass(Node, [{
        key: 'init',
        value: function init() {
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
              var childrenUl = this.$dom.children('ul');

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
      }, {
        key: 'get',
        value: function get() {
          return this.$dom;
        }
      }, {
        key: 'position',
        value: function position() {
          var postions = [];

          var _iterate = function _iterate(node) {
            postions.push(node.$dom.index() + 1);

            if (node.parent && node.parent.type !== 'root') {
              _iterate(node.parent);
            }
          };
          _iterate(this);

          return postions.reverse();
        }
      }, {
        key: 'parents',
        value: function parents() {
          var parents = [];

          var _iterate = function _iterate(node) {
            if (node.parent !== null) {
              parents.push(node.parent);
              _iterate(node.parent);
            }
          };
          _iterate(this);

          return parents;
        }
      }, {
        key: 'children',
        value: function children() {
          var children = [];
          var node = void 0;

          for (var i = 0; i < this._children.length; i++) {
            node = $(this._children[i]).data('node');

            if (node) {
              children.push(node);
            }
          }

          return children;
        }
      }, {
        key: 'siblings',
        value: function siblings() {
          var siblings = [];
          var $siblings = this.$dom.siblings();
          var node = void 0;

          for (var i = 0; i < $siblings.length; i++) {
            node = $siblings.data('node');

            if (node) {
              siblings.push(node);
            }
          }

          return siblings;
        }
      }, {
        key: 'hasChildren',
        value: function hasChildren() {
          return this.$dom.children('ul').children('li').length !== 0;
        }
      }, {
        key: 'isOpened',
        value: function isOpened() {
          if (typeof this.opened === 'undefined') {

            return this.$dom.is('.tree_open');
          }

          return this.opened;
        }
      }, {
        key: 'open',
        value: function open(iterate) {
          this.opened = true;
          this.$dom.addClass('tree_open');

          // open parents nodes

          if (iterate) {
            var parents = this.parents();

            for (var i = 0; i < parents.length; i++) {

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
      }, {
        key: 'close',
        value: function close(iterate) {
          this.opened = false;
          this.$dom.removeClass('tree_open');

          // close children nodes

          if (iterate) {
            var children = this.children();

            for (var i = 0; i < children.length; i++) {

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
      }, {
        key: 'hasChildrenSelect',
        value: function hasChildrenSelect() {
          return this.$dom.find('li.tree_selected').length !== 0;
        }
      }, {
        key: 'hasChildrenSelectBranch',
        value: function hasChildrenSelectBranch() {
          return this.api.$element.find('li.tree_childrenSelected').length !== 0;
        }
      }, {
        key: 'toggleOpen',
        value: function toggleOpen() {
          if (this.opened) {
            this.close();
          } else {
            this.open();
          }

          return this;
        }
      }, {
        key: 'toggleSelect',
        value: function toggleSelect() {
          if (this.selected) {
            this.unselect();
          } else {
            this.select();
          }

          return this;
        }
      }, {
        key: 'select',
        value: function select() {
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
      }, {
        key: 'unselect',
        value: function unselect(force) {
          var _this = this;

          if (this.api.options.canUnselect || force) {
            this.selected = false;
            this.$dom.removeClass('tree_selected');

            if (this.api.options.multiSelect) {
              this.api.selected = $.grep(this.api.selected,

                function(node) {
                  return node.$dom !== _this.$dom;
                }
              );
            } else {
              this.api.selected = null;
            }
          }

          return this;
        }
      }, {
        key: 'toBranch',
        value: function toBranch() {
          if (this.type === 'leaf') {
            var content = this.$dom.html();
            this.$dom.addClass('tree-branch');
            this.$dom.html(this.api.options.tpl.branch(content) + '<ul></ul>');
          }

          return this;
        }
      }, {
        key: 'append',
        value: function append(data) {
          if (this.type === 'leaf') {
            this.toBranch();
          }

          var html = this.api.dataParser.getNode(data);
          var $node = $(html).appendTo(this.$dom.children('ul'));

          if (this.type === 'leaf') {
            this.api.attach(this.$dom, false, this.api);
          } else {
            this.api.attach($node, false, this.api);
          }

          return this;
        }
      }, {
        key: 'prepend',
        value: function prepend(data) {
          if (this.type === 'leaf') {
            this.toBranch();
          }

          var html = this.api.dataParser.getNode(data);
          var $node = $(html).prependTo(this.$dom.children('ul'));

          if (this.type === 'leaf') {
            this.api.attach(this.$dom, false, this.api);
          } else {
            this.api.attach($node, false, this.api);
          }

          return this;
        }
      }, {
        key: 'after',
        value: function after(data) {
          var html = this.api.dataParser.getNode(data);
          this.$dom.after(html);

          var $node = this.$dom.next();
          this.api.attach($node, false, this.api);

          return this;
        }
      }, {
        key: 'before',
        value: function before(data) {
          var html = this.api.dataParser.getNode(data);
          this.$dom.before(html);

          var $node = this.$dom.prev();
          this.api.attach($node, false, this.api);

          return this;
        }
      }, {
        key: 'remove',
        value: function remove() {
          this.$dom.remove();

          return this;
        }
      }]);

      return Node;
    }();

    var HtmlParser = function() {
      function HtmlParser(options) {
        _classCallCheck(this, HtmlParser);

        this.tpl = options.tpl;
      }

      _createClass(HtmlParser, [{
        key: 'getLeaf',
        value: function getLeaf($node) {
          return $node.html();
        }
      }, {
        key: 'getBranch',
        value: function getBranch($node) {
          return $node.children('div').html();
        }
      }, {
        key: 'renderTree',
        value: function renderTree($node, isRoot, api) {
          var _this2 = this;

          var $children = void 0;

          if (isRoot) {
            $children = $node;
            $node.addClass('tree');
          } else {
            $children = $node.children('ul');
          }

          if ($children.length !== 0) {
            // has child
            $node.addClass('tree-branch');

            var _iterate = function _iterate($tree) {
              $tree.children('li').each(

                function(i, node) {
                  var $node = $(node);
                  var html = _this2.tpl.branch(_this2.getBranch($node));

                  $node.children('div').replaceWith(html);

                  _this2.renderTree($node, false, api);
                }
              );
            };
            _iterate($children);
          }
        }
      }]);

      return HtmlParser;
    }();

    var NAMESPACE$1 = 'asTree';

    /**
     * Plugin constructor
     **/

    var asTree = function() {
      function asTree(element, options) {
        _classCallCheck(this, asTree);

        this.$element = (0, _jquery2.default)(element);
        this.options = _jquery2.default.extend(true, {}, DEFAULTS, options);
        this.namespace = this.options.namespace;
        this.dataParser = new DataParser(this.options);
        this.htmlParser = new HtmlParser(this.options);

        this._init();
      }

      _createClass(asTree, [{
        key: '_init',
        value: function _init() {
          if (this.options.dataFromHtml === true) {
            this._createFromHtml();
          } else {
            this._createFromData();
          }

          var $root = this.$element[0].nodeName.toLowerCase() === 'ul' ? this.$element : this.$element.find('ul:first');
          this.root = $root.data('node');

          if (this.options.multiSelect) {
            this.selected = [];
          } else {
            this.selected = null;
          }

          this.autoOpen();

          // Bind events
          this.$element.on({
            click: _jquery2.default.proxy(this._click, this)
          });

          this._trigger('ready');
        }
      }, {
        key: '_trigger',
        value: function _trigger(eventType) {
          var _ref;

          for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            params[_key - 1] = arguments[_key];
          }

          var data = (_ref = [this]).concat.apply(_ref, params);

          // event
          this.$element.trigger(NAMESPACE$1 + '::' + eventType, data);

          // callback
          eventType = eventType.replace(/\b\w+\b/g,

            function(word) {
              return word.substring(0, 1).toUpperCase() + word.substring(1);
            }
          );
          var onFunction = 'on' + eventType;

          if (typeof this.options[onFunction] === 'function') {
            var _options$onFunction;

            (_options$onFunction = this.options[onFunction]).apply.apply(_options$onFunction, [this].concat(params));
          }
        }
      }, {
        key: '_createFromHtml',
        value: function _createFromHtml() {
          var $tree = this.$element[0].nodeName.toLowerCase() === 'ul' ? this.$element : this.$element.find('ul:first');

          this.htmlParser.renderTree($tree, true, this);
          this.attach($tree, true, this);
        }
      }, {
        key: '_createFromData',
        value: function _createFromData() {
          var html = '';

          if (this.options.data) {
            html = this.dataParser.getTree(this.options.data, true);
          }
          this.$element.html(html);
          this.attach(this.$element.children('ul'), true, this);
        }
      }, {
        key: '_click',
        value: function _click(e) {
          var $target = (0, _jquery2.default)(e.target).closest('.tree-toggler, li');
          var $node = (0, _jquery2.default)(e.target).closest('li');
          var node = $node.data('node');

          switch (
          $target.attr('class')) {
            case 'tree-toggler':
              node.toggleOpen();
              break;
            default:
              node.toggleSelect();
              break;
          }
        }
      }, {
        key: 'attach',
        value: function attach($node, isRoot, api) {
          var _this3 = this;

          $node.data('node', new Node($node, isRoot, api));

          var $children = void 0;

          if (isRoot) {
            $children = $node;
          } else {
            $children = $node.children('ul');
          }

          if ($children.length !== 0) {
            // has child
            var _iterate = function _iterate($tree) {
              $tree.children('li').each(

                function(i, node) {
                  var $node = (0, _jquery2.default)(node);
                  _this3.attach($node, false, api);
                }
              );
            };
            _iterate($children);
          }
        }
      }, {
        key: 'open',
        value: function open(position, iterate) {
          var node = this.get(position);

          if (node) {
            node.open(iterate);
          }

          return this;
        }
      }, {
        key: 'close',
        value: function close(position, iterate) {
          var node = this.get(position);

          if (node) {
            node.close(iterate);
          }

          return this;
        }
      }, {
        key: 'select',
        value: function select(position) {
          var node = this.get(position);

          if (node) {
            node.select();
          }

          return this;
        }
      }, {
        key: 'unselect',
        value: function unselect(position) {
          var node = this.get(position);

          if (node) {
            node.unselect();
          }

          return this;
        }
      }, {
        key: 'get',
        value: function get(position) {
          if (!_jquery2.default.isArray(position)) {
            position = [];
          }

          try {
            var _iterate = function _iterate(_node, index) {
              return (0, _jquery2.default)(_node._children[index]).data('node');
            };

            var node = this.root;

            for (var i = 0; i < position.length; i++) {
              node = _iterate(node, position[i] - 1);
            }

            return node;
          } catch (e) {

            return null;
          }
        }
      }, {
        key: 'getRoot',
        value: function getRoot() {
          return this.root;
        }
      }, {
        key: 'getSelected',
        value: function getSelected() {
          return this.selected;
        }
      }, {
        key: 'autoOpen',
        value: function autoOpen() {
          var _this4 = this;

          var $root = this.root.$dom;

          switch (
          _typeof(this.options.autoOpen)) {
            case 'boolean': {
              $root.find('li').each(

                function(i, item) {
                  var $node = (0, _jquery2.default)(item);
                  var node = $node.data('node');

                  if (_this4.options.autoOpen === true && node.type === 'branch') {
                    node.open();
                  }
                }
              );
              break;
            }
            case 'number': {
              $root.find('li').each(

                function(i, item) {
                  var $node = (0, _jquery2.default)(item);
                  var node = $node.data('node');

                  if (node.type === 'branch' && node.level <= _this4.options.autoOpen) {
                    node.open();
                  }
                }
              );
              break;
            }
            case 'object': {

              if (_jquery2.default.isArray(this.options.autoOpen)) {
                this.get(this.options.autoOpen).open(true);
              }
              break;
            }
            default: {
              break;
            }
          }
        }
      }, {
        key: 'append',
        value: function append(position, data) {
          var node = this.get(position);

          if (node) {
            node.append(data);
          }

          return this;
        }
      }, {
        key: 'prepend',
        value: function prepend(position, data) {
          var node = this.get(position);

          if (node) {
            node.prepend(data);
          }

          return this;
        }
      }, {
        key: 'after',
        value: function after(position, data) {
          var node = this.get(position);

          if (node) {
            node.after(data);
          }

          return this;
        }
      }, {
        key: 'before',
        value: function before(position, data) {
          var node = this.get(position);

          if (node) {
            node.before(data);
          }

          return this;
        }
      }, {
        key: 'remove',
        value: function remove(position) {
          var node = this.get(position);

          if (node) {
            node.remove();
          }

          return this;
        }
      }], [{
        key: 'setDefaults',
        value: function setDefaults(options) {
          _jquery2.default.extend(DEFAULTS, _jquery2.default.isPlainObject(options) && options);
        }
      }]);

      return asTree;
    }();

    var info = {
      version: '0.3.0'
    };

    var NAMESPACE = 'asTree';
    var OtherAsScrollbar = _jquery2.default.fn.asTree;

    var jQueryasTree = function jQueryasTree(options) {
      var _this5 = this;

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      if (typeof options === 'string') {
        var _ret = function() {
          var method = options;

          if (/^_/.test(method)) {

            return {
              v: false
            };
          } else if (/^(get)/.test(method)) {
            var instance = _this5.first().data(NAMESPACE);

            if (instance && typeof instance[method] === 'function') {

              return {
                v: instance[method].apply(instance, args)
              };
            }
          } else {

            return {
              v: _this5.each(

                function() {
                  var instance = _jquery2.default.data(this, NAMESPACE);

                  if (instance && typeof instance[method] === 'function') {
                    instance[method].apply(instance, args);
                  }
                }
              )
            };
          }
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object")

          return _ret.v;
      }

      return this.each(

        function() {
          if (!(0, _jquery2.default)(this).data(NAMESPACE)) {
            (0, _jquery2.default)(this).data(NAMESPACE, new asTree(this, options));
          }
        }
      );
    };

    _jquery2.default.fn.asTree = jQueryasTree;

    _jquery2.default.asTree = _jquery2.default.extend({
      setDefaults: asTree.setDefaults,
      noConflict: function noConflict() {
        _jquery2.default.fn.asTree = OtherAsScrollbar;

        return jQueryasTree;
      }
    }, info);
  }
);