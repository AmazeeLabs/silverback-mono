// Workaround for https://github.com/WordPress/gutenberg/issues/19815
drupalSettings.gutenberg._listeners.init.push(function () {
  var coreColumnsAllowed = drupalSettings.editor.formats.gutenberg.editorSettings.allowedBlocks['core/columns'];
  var coreImageAllowed = drupalSettings.editor.formats.gutenberg.editorSettings.allowedBlocks['core/image'];
  if (coreColumnsAllowed && !coreImageAllowed) {
    var coreColumnsBlock = wp.blocks.getBlockType('core/columns');
    // Remove core/image from the example.
    coreColumnsBlock.example.innerBlocks[0].innerBlocks.splice(1, 1);
  }
});
