# jQuery Tree

A jquery tree plugin.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/amazingSurge/jquery-asTree/master/dist/jquery-asTree.min.js
[max]: https://raw.github.com/amazingSurge/jquery-asTree/master/dist/jquery-asTree.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/jquery-asTree.min.js"></script>
<script>
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

	$('#tree').tree({
		data:data
	});
});
</script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
