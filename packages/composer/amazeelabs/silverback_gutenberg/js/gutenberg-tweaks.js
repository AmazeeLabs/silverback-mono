drupalSettings.gutenberg._listeners.init.push(
  // For all block types:
  function () {
    var blockTypes = wp.blocks.getBlockTypes();
    for (var i = 0; i < blockTypes.length; i++) {
      if (!blockTypes[i].supports) {
        blockTypes[i].supports = {};
      }
      // Disable "Additional CSS class(es)" section.
      blockTypes[i].supports.customClassName = false;
      // Disable align options.
      blockTypes[i].supports.align = false;
    }
  },

  // Workaround for https://github.com/WordPress/gutenberg/issues/19815
  function () {
    var coreColumnsAllowed =
      drupalSettings.editor.formats.gutenberg.editorSettings.allowedBlocks[
        "core/columns"
      ];
    var coreImageAllowed =
      drupalSettings.editor.formats.gutenberg.editorSettings.allowedBlocks[
        "core/image"
      ];
    if (coreColumnsAllowed && !coreImageAllowed) {
      var coreColumnsBlock = wp.blocks.getBlockType("core/columns");
      // Remove core/image from the example.
      coreColumnsBlock.example.innerBlocks[0].innerBlocks.splice(1, 1);
    }
  },

  // Remove most of the columns options.
  function () {
    var coreColumnsBlock = wp.blocks.getBlockType("core/columns");
    coreColumnsBlock.supports.inserter = false;
    coreColumnsBlock.supports.align = false;
    coreColumnsBlock.supports.__experimentalColor = false;
  },

  // We never want some of the format options.
  function () {
    wp.richText.unregisterFormatType("core/image");
    wp.richText.unregisterFormatType("core/text-color");
  },

  // We don't want table styles.
  function () {
    wp.blocks.unregisterBlockStyle("core/table", "regular");
    wp.blocks.unregisterBlockStyle("core/table", "stripes");
  }
);
