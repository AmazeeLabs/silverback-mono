// Disable "Additional CSS class(es)" section for all block types.
drupalSettings.gutenberg._listeners.init.push(function () {
  var blockTypes = wp.blocks.getBlockTypes();
  for (var i = 0; i < blockTypes.length; i++) {
    blockTypes[i].supports.customClassName = false;
  }
});
