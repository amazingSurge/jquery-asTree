/*! jQuery Tree - v0.2.0 - 2013-07-03
* https://github.com/amazingSurge/jquery-tree
* Copyright (c) 2013 amazingSurge; Licensed GPL */
(function($) {
    var HtmlParser = (function() {
        var HtmlParser = function(options) {
            this.tpl = options.tpl;
        };
        HtmlParser.prototype = {
            constructor: HtmlParser,
            getLeaf: function($node) {
                return $node.html();
            },
            getBranch: function($node) {
                return $node.children('div').html();
            },
            renderTree: function($node, isRoot, api) {
                var self = this,
                    $children;

                if(isRoot) {
                    $children = $node;
                    $node.addClass('tree');
                } else {
                    $children = $node.children('ul');
                }

                if($children.length !== 0) { // has child              
                    $node.addClass('tree-branch');

                    var _iterate = function($tree) {
                        $tree.children('li').each(function(i, node) {
                            var $node = $(node);
                            var html = self.tpl.branch(self.getBranch($node))

                            $node.children('div').replaceWith(html);

                            self.renderTree($node, false, api)
                        })
                    }
                    _iterate($children);
                }
            }
        };
        return HtmlParser;
    })();

    var DataParser = (function() {
        var DataParser = function(options) {
            this.tpl = options.tpl;
        };
        DataParser.prototype = {
            constructor: DataParser,
            getLeaf: function(data) {
                var content = this.tpl.leaf(data);

                return '<li>' + content + '</li>';
            },
            getBranch: function(data) {
                var content = this.tpl.branch(data),
                    children = this.getTree(data.children);

                return '<li class="tree-branch">' + content + children + '</li>';
            },
            getNode: function(data) {
                if(data.children) {
                    return this.getBranch(data);
                } else {
                    return this.getLeaf(data);
                }
            },
            getTree: function(data, isRoot) {
                var output = '';
                for(var key in data) {
                    output += this.getNode(data[key]);
                }
                if(isRoot) {
                    return '<ul class="tree">' + output + '</ul>';
                } else {
                    return '<ul>' + output + '</ul>';
                }
            }
        };
        return DataParser;
    })();


    var Node = (function() {
        var Node = function($dom, isRoot, api) {
            this.$dom = $dom;
            this.api = api;

            if(isRoot == null) {
                isRoot = false;
            }

            if(isRoot) {
                this.type = 'root';
            } else {
                this.selected = false;
                if(this.hasChildren()) {
                    this.type = 'branch';
                    this.opened = this.isOpened();
                } else {
                    this.type = 'leaf';
                }
            }
            this.init();

        };
        Node.prototype = {
            init: function() {
                switch(this.type) {
                    case 'root':
                        this._children = this.$dom.get(0).children;
                        this.level = 0;
                        this.parent = null;
                        this.$parent = null;
                        break;
                    case 'branch':
                    case 'leaf':
                        var children_ul = this.$dom.children('ul');
                        if(children_ul.length > 0) {
                            this._children = children_ul.get(0).children;
                        } else {
                            this._children = [];
                        }

                        this.$parent = this.$dom.parents('li.tree-branch').eq(0);

                        if(this.$parent.length === 0) {
                            this.$parent = this.$dom.parent();
                        }

                        this.parent = this.$parent.data('node');
                        this.level = this.parent.level + 1;
                        break;
                }
            },
            // Retrieve the DOM elements matched by the Node object.
            get: function() {
                return this.$dom;
            },
            position: function(){
                var postions = [];
                
                var _iterate = function(node){
                    postions.push(node.$dom.index()+1);
                    if(node.parent && node.parent.type !== 'root'){
                        _iterate(node.parent);
                    }
                }
                _iterate(this);

                return postions.reverse();
            },
            parents: function() {
                var parents = [];

                var _iterate = function(node) {
                    if(node.parent !== null) {
                        parents.push(node.parent);
                        _iterate(node.parent);
                    }
                };
                _iterate(this);
                return parents;
            },
            children: function() {
                var children = [];
                var node;
                for(var i = 0; i < this._children.length; i++) {
                    node = $(this._children[i]).data('node');
                    if(node) {
                        children.push(node);
                    }
                }

                return children;
            },
            siblings: function() {
                var siblings = [];
                var $siblings = this.$dom.siblings();
                var node;

                for(var i = 0; i < $siblings.length; i++) {
                    node = $siblings.data('node');
                    if(node) {
                        siblings.push(node);
                    }
                }
                return siblings;
            },
            hasChildren: function() {
                return this.$dom.children('ul').children('li').length !== 0;
            },
            isOpened: function() {
                if(typeof this.opened === 'undefined') {
                    return this.$dom.is('.tree-open');
                } else {
                    return this.opened;
                }
            },
            open: function(iterate) {
                this.opened = true;
                this.$dom.addClass('tree-open');

                // open parents nodes
                if(iterate) {
                    var parents = this.parents();
                    for(var i = 0; i < parents.length; i++) {
                        if(parents[i].type !== 'root') {
                            parents[i].open();
                        }                      
                    }
                }

                return this;
            },
            close: function(iterate) {
                this.opened = false;
                this.$dom.removeClass('tree-open');

                // close children nodes
                if(iterate) {
                    var children = this.children();
                    for(var i = 0; i < children.length; i++) {
                        if(children[i].type === 'branch') {
                            children[i].close(true);
                        }
                    }

                }

                return this;
            },
            toggleOpen: function() {
                if(this.opened) {
                    this.close();
                } else {
                    this.open();
                }
                return this;
            },
            toggleSelect: function(deselect) {
                if(deselect) {
                   if(this.selected) {
                        this.unselect();
                        return false;
                    } else {
                        this.select();
                        return true;
                    } 
                }else{
                    this.select();
                    return true;
                }
		
		return this;
            },
            select: function() {
                this.selected = true;
                this.$dom.addClass('tree-selected');
                return this;
            },
            unselect: function() {
                this.selected = false;
                this.$dom.removeClass('tree-selected');
                return this;
            },
            toBranch: function() {
                if(this.type === 'leaf') {
                    var content = this.$dom.html();
                    this.$dom.addClass('tree-branch');
                    this.$dom.html(this.api.options.tpl.branch(content) + '<ul></ul>');
                }
                return this;
            },
            append: function(data) {
                if(this.type === 'leaf') {
                    this.toBranch();
                }

                var html = this.api.dataParser.getNode(data);
                var $node = $(html).appendTo(this.$dom.children('ul'));

                if(this.type === 'leaf') {
                    this.api.attach(this.$dom, false, this.api);
                } else {
                    this.api.attach($node, false, this.api);
                }

                return this;
            },
            prepend: function(data) {
                if(this.type === 'leaf') {
                    this.toBranch();
                }

                var html = this.api.dataParser.getNode(data);
                var $node = $(html).prependTo(this.$dom.children('ul'));

                if(this.type === 'leaf') {
                    this.api.attach(this.$dom, false, this.api);
                } else {
                    this.api.attach($node, false, this.api);
                }

                return this;
            },
            after: function(data) {
                var html = this.api.dataParser.getNode(data);
                this.$dom.after(html);

                var $node = this.$dom.next();
                this.api.attach($node, false, this.api);
                return this;
            },
            before: function(data) {
                var html = this.api.dataParser.getNode(data);
                this.$dom.before(html);

                var $node = this.$dom.prev();
                this.api.attach($node, false, this.api);
                return this;
            },
            remove: function() {
                this.$dom.remove();

                return this;
            }
        };
        return Node;
    })();

    var Tree = (function() {
        var Tree = $.tree = function(element, options) {
            this.$el = $(element);
            this.options = $.extend(true, {}, Tree.defaults, options);
            this.namespace = this.options.namespace;
            this.dataParser = new DataParser(this.options);
            this.htmlParser = new HtmlParser(this.options);

            this._init();
        };

        Tree.defaults = {
            namespace: 'tree',
            autoOpen: [1, 2], //true/false/1/2...
            // keyboard: false, // Support keyboard navigation.
            dataFromHtml: false,
            data: null,
            multiSelect: false,
            deselect: false,

            tpl: {
                toggler: function(node) {
                    return '<i class="tree-toggler"></i>'
                },
                branch: function(node) {
                    var content = this.branchContent(node);
                    var toggler = this.toggler(node);
                    return '<div class="tree-element">' +
                        toggler +
                        '<div class="element-content">' + content + '</div>' +
                        '</div>';
                },
                branchContent: function(node) {
                    if(typeof(node) === 'object') {
                        return node.name;
                    } else {
                        return node;
                    }
                },
                leaf: function(node) {
                    var content = this.leafContent(node);

                    return content;
                },
                leafContent: function(node) {
                    if(typeof node === 'object') {
                        return node.name;
                    } else {
                        return node;
                    }
                }
            }
        };

        Tree.prototype = {
            constructor: Tree,
            _init: function() {
                // init structure
                var self = this;
                if(this.options.dataFromHtml === true) {
                    this._createFromHtml();
                } else {
                    this._createFromData();
                }

                var $root = (this.$el[0].nodeName.toLowerCase() === 'ul' ? this.$el : this.$el.find('ul:first'));
                this.root = $root.data('node');

                if(this.options.multiSelect){
                    this.selected = [];
                }else{
                    this.selected = null;
                }

                this.autoOpen();

                // Bind events
                this.$el.on({
                    click: $.proxy(this._click, this)
                });
            },
            _createFromHtml: function() {
                var $tree = (this.$el[0].nodeName.toLowerCase() === 'ul' ? this.$el : this.$el.find('ul:first'));

                this.htmlParser.renderTree($tree, true, this);
                this.attach($tree, true, this);
            },
            _createFromData: function() {
                var html = '';
                if(this.options.data) {
                    html = this.dataParser.getTree(this.options.data, true);
                }
                this.$el.html(html);
                this.attach(this.$el.children('ul'), true, this);
            },
            _click: function(e) {
                var $target = $(e.target).closest('.tree-toggler, li'),
                    $node = $(e.target).closest('li'),
                    node = $node.data('node');

                switch($target.attr('class')) {
                    case 'tree-toggler':
                        node.toggleOpen();
                        if(!this.options.multiSelect) {
                            if($node.find('li').hasClass('tree-selected')) {
                                if(node.opened) {
                                    $node.removeClass('children-selected');
                                }else{
                                    $node.addClass('children-selected');
                                }
                            }
                        }
                        
                        break;
                    default:
                        var judge = node.toggleSelect(this.options.deselect);
                        if(this.options.multiSelect) {
                            if(judge){
                                this.selected.push(node);
                            }else{
                                this.selected = $.grep(this.selected, function(n){
                                    return n.$dom !== node.$dom;
                                });
                            }
                        }else{
                            if(this.selected) {
                                if(this.options.deselect) {
                                   this.selected.unselect(); 
                                }else if(this.selected !== node) {
                                    this.selected.unselect();
                                }
                            }

                            if(judge){
                                this.selected = node;
                            }else{
                                this.selected = null;
                            }
                        }
                        break;
                }
            },
            attach: function($node, isRoot, api) {
                var self = this;
                $node.data('node', new Node($node, isRoot, api));

                var $children;
                if(isRoot) {
                    $children = $node;
                } else {
                    $children = $node.children('ul');
                }

                if($children.length !== 0) { // has child
                    var _iterate = function($tree) {
                        $tree.children('li').each(function(i, node) {
                            var $node = $(node);
                            self.attach($node, false, api);
                        });
                    };
                    _iterate($children);
                }
            },
            open: function(position, iterate) {
                var node = this.get(position);
                if(node) {
                    node.open(iterate);
                }
                return this;
            },
            close: function(position, iterate) {
                var node = this.get(position);
                if(node) {
                    node.close(iterate);
                }
                return this;
            },
            select: function(position) {
                var node = this.get(position);
                if(node) {
                    node.select();
                }
                return this;
            },
            unselect: function(position) {
                var node = this.get(position);
                if(node) {
                    node.unselect();
                }
                return this;
            },
            get: function(position) {
                if(!$.isArray(position)) {
                    position = [];
                }

                try {
                    var _iterate = function(_node, index) {
                        return $(_node._children[index]).data('node');
                    }

                    var node = this.root;
                    for(var i = 0; i < position.length; i++) {
                        node = _iterate(node, position[i] - 1)
                    }
                } catch(e) {
                    return null;
                }
                return node;
            },
            getRoot: function() {
                return this.root;
            },
            getSelected: function(){
                return this.selected;
            },
            autoOpen: function() {
                var self = this,
                    $root = this.root.$dom;

                switch(typeof self.options.autoOpen) {
                    case 'boolean':
                        $root.find('li').each(function(i, item) {
                            var $node = $(item),
                                node = $node.data('node');
                            if(self.options.autoOpen === true && node.type === 'branch') {
                                node.open();
                            }
                        });
                        break;
                    case 'number':
                        $root.find('li').each(function(i, item) {
                            var $node = $(item),
                                node = $node.data('node');
                            if(node.type === 'branch' && node.level <= self.options.autoOpen) {
                                node.open();
                            }
                        });
                        break;
                    case 'object':
                        if($.isArray(self.options.autoOpen)) {
                            this.get(self.options.autoOpen).open(true);
                        }
                        break;
                }
            },
            append: function(position, data) {
                var node = this.get(position);
                if(node) {
                    node.append(data);
                }
                return this;
            },
            prepend: function(position, data) {
                var node = this.get(position);
                if(node) {
                    node.prepend(data);
                }
                return this;
            },
            after: function(position, data) {
                var node = this.get(position);
                if(node) {
                    node.after(data);
                }
                return this;
            },
            before: function(position, data) {
                var node = this.get(position);
                if(node) {
                    node.before(data);
                }
                return this;
            },
            remove: function(position) {
                var node = this.get(position);
                if(node) {
                    node.remove(data);
                }
                return this;
            }
        };
        return Tree;
    })();

    $.fn.tree = function(options) {
        if(typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;
            if(/^(getRoot|get|getSelected)$/.test(method)) {
                var api = this.first().data('tree');
                if(api && typeof api[method] === 'function') {
                    return api[method].apply(api, method_arguments);
                }
            } else {
                return this.each(function() {
                    var api = $.data(this, 'tree');
                    if(api && typeof api[method] === 'function') {
                        api[method].apply(api, method_arguments);
                    }
                });
            }
        } else {
            return this.each(function() {
                if(!$.data(this, 'tree')) {
                    $.data(this, 'tree', new Tree(this, options));
                }
            });
        }
    };

}(jQuery));
