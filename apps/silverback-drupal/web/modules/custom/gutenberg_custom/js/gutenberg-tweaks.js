drupalSettings.gutenberg._listeners.init.push(

  // Disable "Additional CSS class(es)" section for all block types.
  function () {
    var blockTypes = wp.blocks.getBlockTypes();
    for (var i = 0; i < blockTypes.length; i++) {
      blockTypes[i].supports.customClassName = false;
    }
  },

  // Workaround for https://github.com/WordPress/gutenberg/issues/19815
  function () {
    var coreColumnsAllowed = drupalSettings.editor.formats.gutenberg.editorSettings.allowedBlocks['core/columns'];
    var coreImageAllowed = drupalSettings.editor.formats.gutenberg.editorSettings.allowedBlocks['core/image'];
    if (coreColumnsAllowed && !coreImageAllowed) {
      var coreColumnsBlock = wp.blocks.getBlockType('core/columns');
      // Remove core/image from the example.
      coreColumnsBlock.example.innerBlocks[0].innerBlocks.splice(1, 1);
    }
  },
);
