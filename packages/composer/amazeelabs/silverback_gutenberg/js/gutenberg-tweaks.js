/* global drupalSettings, wp, jQuery */
(function ($) {
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
          'core/columns'
        ];
      var coreImageAllowed =
        drupalSettings.editor.formats.gutenberg.editorSettings.allowedBlocks[
          'core/image'
        ];
      if (coreColumnsAllowed && !coreImageAllowed) {
        var coreColumnsBlock = wp.blocks.getBlockType('core/columns');
        // Remove core/image from the example.
        coreColumnsBlock.example.innerBlocks[0].innerBlocks.splice(1, 1);
      }
    },
    // Disable fullscreen mode.
    function () {
      const isFullscreenMode = wp.data
        .select('core/edit-post')
        .isFeatureActive('fullscreenMode');

      if (isFullscreenMode) {
        wp.data.dispatch('core/edit-post').toggleFeature('fullscreenMode');
      }
    },
    // Remove most of the columns options.
    function () {
      var coreColumnsBlock = wp.blocks.getBlockType('core/columns');
      coreColumnsBlock.supports.inserter = false;
      coreColumnsBlock.supports.align = false;
      coreColumnsBlock.supports.__experimentalColor = false;
    },

    // We never want some of the format options.
    function () {
      wp.richText.unregisterFormatType('core/image');
      wp.richText.unregisterFormatType('core/text-color');
    },

    // We don't want table styles.
    function () {
      wp.blocks.unregisterBlockStyle('core/table', 'regular');
      wp.blocks.unregisterBlockStyle('core/table', 'stripes');
    },

    // Workaround for https://www.drupal.org/project/gutenberg/issues/3261702
    function () {
      $('.gutenberg-full-editor').on('keydown', function (event) {
        if (
          event &&
          (event.code === 'Enter' || event.code === 'Space') &&
          event.target &&
          $(event.target).hasClass('block-editor-link-control__search-submit')
        ) {
          var $chosenResult = $(event.target)
            .closest('.block-editor-link-control__search-input-wrapper')
            .find(
              '.block-editor-link-control__search-results button[aria-selected="true"].is-entity',
            );
          if ($chosenResult.length) {
            event.preventDefault();
            $chosenResult.click();
          }
        }
      });
    },

    // Validators: highlight the relevant blocks and scroll to the first error.
    function () {
      const { select, subscribe } = wp.data;

      const closeListener = subscribe(() => {
        const isReady = select('core/editor').__unstableIsEditorReady();
        if (!isReady) {
          // Editor not ready.
          return;
        }
        // Close the listener as soon as we know we are ready to avoid an infinite loop.
        closeListener();

        // It seems that, even with this listener, we still need a timeout.
        window.setTimeout(function () {
          // Get all the validation errors based on the messages.
          const validationErrors = {};
          Array.from(
            document.getElementsByClassName('block-validation-error'),
          ).forEach(function (item) {
            const blockType = item.getAttribute('data-block-type');
            const blockInstance = parseInt(
              item.getAttribute('data-block-instance'),
            );
            if (!(blockType in validationErrors)) {
              validationErrors[blockType] = [];
            }
            validationErrors[blockType].push(blockInstance);
          });

          const blockTypeInstances = {};
          let firstErrorBlockId = null;

          // Append invalid class to the relevant blocks.
          Array.from(document.getElementsByClassName('wp-block')).forEach(
            function (item) {
              const blockType = item.getAttribute('data-type');
              if (!(blockType in blockTypeInstances)) {
                blockTypeInstances[blockType] = [];
              }
              blockTypeInstances[blockType].push(item);
              if (blockType in validationErrors) {
                const blockId = item.getAttribute('data-block');
                const blockInstanceId = blockTypeInstances[blockType].length;
                if (validationErrors[blockType].includes(blockInstanceId)) {
                  // Somehow, altering the item directly causes issues with
                  // the block editor. So we use jQuery instead.
                  $('div[data-block="' + blockId + '"]').addClass('not-valid');
                  if (firstErrorBlockId === null) {
                    firstErrorBlockId = blockId;
                  }
                }
              }
            },
          );

          // Scroll to the first error.
          if (firstErrorBlockId !== null) {
            document
              .querySelector('div[data-block="' + firstErrorBlockId + '"]')
              .scrollIntoView({
                behavior: 'smooth',
              });
          }
        }, 1000);
      });
    },
  );
})(jQuery);
