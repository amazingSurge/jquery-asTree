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

          this.renderTree($node, false, api)
        })
      };
      _iterate($children);
    }
  }
}

export default HtmlParser;
