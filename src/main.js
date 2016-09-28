import $ from 'jquery';
import asTree from './asTree';
import info from './info';

const NAMESPACE = 'asTree';
const OtherAsScrollbar = $.fn.asTree;

const jQueryasTree = function(options, ...args) {
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
        const instance = $.data(this, NAMESPACE);
        if (instance && typeof instance[method] === 'function') {
          instance[method](...args);
        }
      });
    }
  }

  return this.each(function() {
    if (!$(this).data(NAMESPACE)) {
      $(this).data(NAMESPACE, new asTree(this, options));
    }
  });
};

$.fn.asTree = jQueryasTree;

$.asTree = $.extend({
  setDefaults: asTree.setDefaults,
  noConflict: function() {
    $.fn.asTree = OtherAsScrollbar;
    return jQueryasTree;
  }
}, info);
