/*
 * jquery-tree
 * https://github.com/VicWei/jquery-tree
 *
 * Copyright (c) 2013 VicWei
 * Licensed under the MIT license.
 */

(function($) {
    var HtmlParser = (function() {
        var HtmlParser = function(options){
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
                var self = this, $children;

                if(isRoot) {
                    $children = $node;
                    $node.addClass('tree');
                }else{
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
        var DataParser = function(options){
            this.tpl = options.tpl;
        };
        DataParser.prototype = {
            constructor: DataParser,
            getLeaf : function(data){
                var content = this.tpl.leaf(data);

                return '<li>' + content +'</li>';

            },
            getBranch : function(data){
                var content = this.tpl.branch(data), 
                    children = this.getTree(data.children);

                return '<li class="tree-branch">' + content + children +'</li>';
            },
            getNode: function(data){
                if(data.children){
                    return this.getBranch(data);
                }else{
                    return this.getLeaf(data);
                }
            },
            getTree: function(data, isRoot){
                var output = '';
                for(var key in data) {
                    output += this.getNode(data[key]);
                }
                if(isRoot){
                    return '<ul class="tree">' + output + '</ul>';
                } else {
                    return '<ul>' + output + '</ul>';
                }            
            }
        };
        return DataParser;
    })();


    var Node = (function(){
        var Node = function($dom, isRoot, api){
            this.$dom = $dom;
            this.api = api;
            var position, parentPosition;

            if (isRoot == null) { isRoot = false; }

            this.position = [];

            if (isRoot) {
                this.type = 'root';
                
            } else {
                this.selected = false;
                if(this.hasChildren()) {
                    this.type = 'branch';
                    this.opened = false;
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
                        this.children = this.$dom.get(0).children;
                        // this.position = [];
                        this.level = 0;
                        this.$parent = null;
                        break;
                    case 'branch':
                    case 'leaf':
                        var children_ul = this.$dom.children('ul');
                        if(children_ul.length > 0){
                            this.children = children_ul.get(0).children;
                        }

                        //this.children = this.$dom.children('ul').children();
                        this.$parent = this.$dom.parents('li.tree-branch').eq(0);

                        if(this.$parent.length === 0) {
                            this.$parent = this.$dom.parent();
                        }

                        this.parent = this.$parent.data('node');
                        // this.position = this.parent.position.concat([this.$dom.index()+1]);
                        this.level = this.parent.level + 1;
                        break;
                }
            },
            getDom: function() {
                return this.$dom;
            },
            getParent: function() {
                return this.$parent;
            },
            getChildren: function() {
                return $(this.children);
            },
            hasChildren: function() {
                return this.$dom.children('ul').children('li').length !== 0;
            },
            open: function(iterate){
                this.opened = true;
                this.$dom.addClass('tree-open');
                this.childrenSelect();

                if (iterate){
                    var _iterate = function(_node) {
                        if(_node.parent){
                            _node.parent.open(true);
                            _iterate(_node.parent);
                        }  
                    }
                    _iterate(this);
                }
            },
            close: function(iterate){
                this.opened = false;
                this.$dom.removeClass('tree-open');
                this.childrenSelect();

                if(iterate) {
                    var _iterate = function(_node) {
                        for(var i=0; i< _node.children.length; i++){
                            var item = _node.children[i],
                                $node = $(item),
                                node = $node.data('node');
                            if(node.type === 'branch') {
                                node.close(true);
                            }
                        }
                    }
                    _iterate(this);
                }
                         
            },
            childrenSelect: function() {
                if(this.$dom.find('li').hasClass('tree-selected')) {
                    this.$dom[this.opened ? 'removeClass' : 'addClass']('children-selected');
                }
            },
            toggle: function(){
                if(this.opened){
                    this.close();
                }else{
                    this.open();
                }
            },
            select: function(nodes){
                nodes.each(function (i, node) {
                    var $node = $(node); 
                    $node.data('node').selected = false;
                    $node.removeClass('children-selected');
                    $node.removeClass('tree-selected');
                });

                this.selected = true;
                this.$dom.addClass('tree-selected');
            },
            switchType: function(node) {
                if(node.type === 'leaf'){
                    var content = this.$dom.html();
                    node.$dom.addClass('tree-branch');
                    node.$dom.html(this.api.options.tpl.branch(content) + '<ul></ul>');
                }
            },
            append: function(data){
                var html = this.api.dataParser.getNode(data);

                this.switchType(this.$dom.data('node'));

                var $node = $(html).appendTo(this.$dom.children('ul'));

                if(this.type === 'leaf'){
                    this.api.attach(this.$dom, false, this.api);
                }else{
                    this.api.attach($node, false, this.api);
                }

                return this;
            },
            prepend: function(data){
                var html = this.api.dataParser.getNode(data);

                this.switchType(this.$dom.data('node'));

                var $node = $(html).prependTo(this.$dom.children('ul'));

                if(this.type === 'leaf'){
                    this.api.attach(this.$dom, false, this.api);
                }else{
                    this.api.attach($node, false, this.api);
                }

                return this;

            },
            after: function(data){
                var html = this.api.dataParser.getNode(data);
                this.$dom.after($(html));
                var $node = this.$dom.next();
                this.api.attach($node, false, this.api);
                return this;
            },
            before: function(data){
                var html = this.api.dataParser.getNode(data);
                this.$dom.before($(html));
                var $node = this.$dom.prev();
                this.api.attach($node, false, this.api);
                return this;
            },
            remove: function() {
                this.$dom.remove();
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

            tpl: {
                toggler: function(node){
                    return '<i class="tree-toggler"></i>'
                },
                branch: function(node) {
                    var content = this.branchContent(node);
                    var toggler = this.toggler(node);

                    return  '<div class="tree-element">' +
                                toggler +
                                '<div class="element-content">' + content + '</div>' +
                            '</div>';
                },
                branchContent: function(node){
                    if(typeof(node) === 'object'){
                        return node.name;
                    }else{
                        return node;
                    }
                },
                leaf: function(node) {
                    var content = this.leafContent(node);

                    return content;
                },
                leafContent: function(node){
                    if(typeof(node) === 'object'){
                        return node.name;
                    }else{
                        return node;
                    }
                }
            },
            onTogglerClick: function() {
            
            },
            onBranchClick: function() {

            },
            onLeafClick: function() {

            }      
        };

        Tree.prototype = {
            constructor: Tree,
            _init: function() {
                // init structure
                var self = this;
                if (this.options.dataFromHtml === true) {
                    this._createFromHtml();
                } else {
                    this._createFromData();
                } 

                var $root = (this.$el[0].nodeName.toLowerCase() === 'ul' ? this.$el : this.$el.find('ul:first'));
                this.root = $root.data('node');

                console.log(typeof this.options.autoOpen)
                this.autoOpen();

                // Bind events
                this.$el.on({
                    click: $.proxy(this._click, this)
                });
            },
            open: function(position, iterate){
                var node = this.get(position);
                if(node){
                    return node.open(iterate);
                }
            },
            close: function(position, iterate){
                var node = this.get(position);
                if(node){
                    return node.close(iterate);
                }
            },
            select: function(position){
                var node = this.get(position);
                if(node) {
                    return node.select(this.$el.find('li'));
                }
            },
            get: function(position) {
                if(!$.isArray(position)){
                    position = [];
                }

                try {
                    var _iterate = function(node, index){
                        return $(node.children[index]).data('node');
                    }

                    var node = this.root;
                    for(var i in position){
                        node = _iterate(node, position[i]-1)
                    }
                } catch(e) {
                    return null;
                }
                return node;
            },
            getRoot: function(){
                return this.root;
            },
            autoOpen: function() {
                var self = this,
                    $root = this.root.$dom;

                switch(typeof self.options.autoOpen){
                    case 'boolean':
                    $root.find('li').each(function (i, item){
                        var $node = $(item),
                            node = $node.data('node');
                        if(self.options.autoOpen === true && node.type === 'branch') {
                            node.open();
                        }
                    });
                        break;
                    case 'number':
                    $root.find('li').each(function (i, item){
                        var $node = $(item),
                            node = $node.data('node');
                        if(node.type === 'branch' && node.level <= self.options.autoOpen) {
                            node.open();
                        }
                    });
                        break;
                    case 'object':
                        if($.isArray(self.options.autoOpen)){
                             // var _iterate = function(node) {
                             //    if(node.parent){
                             //        node.parent.open(true);
                             //        _iterate(node.parent);
                             //    }  
                             // }
                             // _iterate(self.get(self.options.autoOpen));
                             self.get(self.options.autoOpen).open(true);
                        }
                        break;
                }
            },
            append: function(position, data){
                var node = this.get(position);
                if(node){
                    return node.append(data);
                }
            },
            prepend: function(position, data){
                var node = this.get(position);
                if(node){
                    return node.prepend(data);
                }
            },
            after: function(position, data){
                var node = this.get(position);
                if(node){
                    return node.after(data);
                }
            },
            before: function(position,data){
                var node = this.get(position);
                if(node){
                    return node.before(data);
                }
            },
            remove: function(position) {;
                var node = this.get(position);
                if(node){
                    return node.remove(data);
                }
            },
            attach: function($node, isRoot, api){
                var self = this;
                $node.data('node', new Node($node, isRoot, api));

                var $children;
                if(isRoot){
                    $children = $node;
                } else {
                    $children = $node.children('ul');
                }
                
                if($children.length !== 0) { // has child
                    var _iterate = function ($tree) {
                        $tree.children('li').each(function(i, node){
                            var $node = $(node);
                            self.attach($node, false, api);
                        });
                    };
                    _iterate($children);
                }
            },
            _createFromData: function(){
                var html = '';
                if(this.options.data){
                    html = this.dataParser.getTree(this.options.data, true);
                }
                this.$el.html(html);
                this.attach(this.$el.children('ul'), true, this);
            },
            _createFromHtml: function() {
                var $tree = (this.$el[0].nodeName.toLowerCase() === 'ul' ? this.$el : this.$el.find('ul:first'));
                
                this.htmlParser.renderTree($tree, true, this);
                this.attach($tree, true, this);
            },
            _click: function(e) {
                var $target = $(e.target).closest('.tree-toggler, li')
                    $node = $(e.target).closest('li'),
                    node = $node.data('node');

                switch ($target.attr('class')){
                    case 'tree-toggler':
                        node.toggle();
                        break;
                    default:
                        node.select(this.$el.find('li'));
                        break;
                }
                // console.log($node,node) 
                // console.log(node.$parent, node.$parent.data('node'))
                // console.log(node.$parent.children('ul').children('li'))
            }
        };
        return Tree;
    })();

    $.fn.tree = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;
            if(/^()$/.test(method)){
                var api = this.first().data('tree');
                if (api && typeof api[method] === 'function') {
                    return api[method].apply(api, method_arguments);
                }
            } else {
                return this.each(function() {
                    var api = $.data(this, 'tree');
                    if (api && typeof api[method] === 'function') {
                        api[method].apply(api, method_arguments);
                    }
                });
            }
        } else {
            return this.each(function() {
                if (!$.data(this, 'tree')) {
                    $.data(this, 'tree', new Tree(this, options));
                }
            });
        }
    };

}(jQuery));
