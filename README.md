# [jQuery asTree](https://github.com/amazingSurge/jquery-asTree) ![bower][bower-image] [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![prs-welcome]](#contributing)

> A jquery tree plugin.

## Table of contents
- [Main files](#main-files)
- [Quick start](#quick-start)
- [Requirements](#requirements)
- [Usage](#usage)
- [Examples](#examples)
- [Options](#options)
- [Methods](#methods)
- [Events](#events)
- [No conflict](#no-conflict)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [Development](#development)
- [Changelog](#changelog)
- [Copyright and license](#copyright-and-license)

## Main files
```
dist/
├── jquery-asTree.js
├── jquery-asTree.es.js
├── jquery-asTree.min.js
└── css/
    ├── asTree.css
    └── asTree.min.css
```

## Quick start
Several quick start options are available:
#### Download the latest build

 * [Development](https://raw.githubusercontent.com/amazingSurge/jquery-asTree/master/dist/jquery-asTree.js) - unminified
 * [Production](https://raw.githubusercontent.com/amazingSurge/jquery-asTree/master/dist/jquery-asTree.min.js) - minified

#### Install From Bower
```sh
bower install jquery-asTree --save
```

#### Install From Npm
```sh
npm install jquery-asTree --save
```

#### Install From Yarn
```sh
yarn add jquery-asTree
```

#### Build From Source
If you want build from source:

```sh
git clone git@github.com:amazingSurge/jquery-asTree.git
cd jquery-asTree
npm install
npm install -g gulp-cli babel-cli
gulp build
```

Done!

## Requirements
`jquery-asTree` requires the latest version of [`jQuery`](https://jquery.com/download/).

## Usage
#### Including files:

```html
<link rel="stylesheet" href="/path/to/asTree.css">
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery-asTree.js"></script>
```

#### Required HTML structure

```html
<div class="tree"></div>
```

#### Initialization
All you need to do is call the plugin on the element:

```javascript
jQuery(function($) {
  var data = [{
    name: 'folder1',
    children: [
      { name: 'child1'},
      { name: 'child2'}
    ]
  },{
    name: 'folder2',
    children: [{ 
      name: 'folder3',
      children: [
        { name: 'child3'},
        { name: 'child4'}
      ]
    }]
  },{
    name: 'child5'
  }];

  $('.tree').asTree({
    data:data
  });
});
```

## Examples
There are some example usages that you can look at to get started. They can be found in the
[examples folder](https://github.com/amazingSurge/jquery-asTree/tree/master/examples).

## Options
`jquery-asTree` can accept an options object to alter the way it behaves. You can see the default options by call `$.asTree.setDefaults()`. The structure of an options object is as follows:

```
{
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
}
```

## Methods
Methods are called on asTree instances through the asTree method itself.
You can also save the instances to variable for further use.

```javascript
// call directly
$().asTree('destroy');

// or
var api = $().data('asTree');
api.destroy();
```

#### enable()
Enable the tree functions.
```javascript
$().asTree('enable');
```

#### disable()
Disable the tree functions.
```javascript
$().asTree('disable');
```

#### destroy()
Destroy the tree instance.
```javascript
$().asTree('destroy');
```

## Events
`jquery-asTree` provides custom events for the plugin’s unique actions. 

```javascript
$('.the-element').on('asTree::ready', function (e) {
  // on instance ready
});

```

Event   | Description
------- | -----------
ready   | Fires when the instance is ready for API use.
enable  | Fired immediately when the `enable` instance method has been called.
disable | Fired immediately when the `disable` instance method has been called.
destroy | Fires when an instance is destroyed. 

## No conflict
If you have to use other plugin with the same namespace, just call the `$.asTree.noConflict` method to revert to it.

```html
<script src="other-plugin.js"></script>
<script src="jquery-asTree.js"></script>
<script>
  $.asTree.noConflict();
  // Code that uses other plugin's "$().asTree" can follow here.
</script>
```

## Browser support

Tested on all major browsers.

| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/safari/safari_32x32.png" alt="Safari"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/chrome/chrome_32x32.png" alt="Chrome"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/firefox/firefox_32x32.png" alt="Firefox"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/edge/edge_32x32.png" alt="Edge"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer/internet-explorer_32x32.png" alt="IE"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/opera/opera_32x32.png" alt="Opera"> |
|:--:|:--:|:--:|:--:|:--:|:--:|
| Latest ✓ | Latest ✓ | Latest ✓ | Latest ✓ | 9-11 ✓ | Latest ✓ |

As a jQuery plugin, you also need to see the [jQuery Browser Support](http://jquery.com/browser-support/).

## Contributing
Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md). Make sure you're using the latest version of `jquery-asTree` before submitting an issue. There are several ways to help out:

* [Bug reports](CONTRIBUTING.md#bug-reports)
* [Feature requests](CONTRIBUTING.md#feature-requests)
* [Pull requests](CONTRIBUTING.md#pull-requests)
* Write test cases for open bug issues
* Contribute to the documentation

## Development
`jquery-asTree` is built modularly and uses Gulp as a build system to build its distributable files. To install the necessary dependencies for the build system, please run:

```sh
npm install -g gulp
npm install -g babel-cli
npm install
```

Then you can generate new distributable files from the sources, using:
```
gulp build
```

More gulp tasks can be found [here](CONTRIBUTING.md#available-tasks).

## Changelog
To see the list of recent changes, see [Releases section](https://github.com/amazingSurge/jquery-asTree/releases).

## Copyright and license
Copyright (C) 2016 amazingSurge.

Licensed under [the LGPL license](LICENSE).

[⬆ back to top](#table-of-contents)

[bower-image]: https://img.shields.io/bower/v/jquery-asTree.svg?style=flat
[bower-link]: https://david-dm.org/amazingSurge/jquery-asTree/dev-status.svg
[npm-image]: https://badge.fury.io/js/jquery-asTree.svg?style=flat
[npm-url]: https://npmjs.org/package/jquery-asTree
[license]: https://img.shields.io/npm/l/jquery-asTree.svg?style=flat
[prs-welcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[daviddm-image]: https://david-dm.org/amazingSurge/jquery-asTree.svg?style=flat
[daviddm-url]: https://david-dm.org/amazingSurge/jquery-asTree


