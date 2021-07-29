(function ($, Drupal, drupalSettings) {

    Drupal.behaviors.silverbackExternalPreview = {
        attach: function (context, settings) {
            const $sizeLinks = $("button[data-preview-url]", context);
            $sizeLinks.on("click", function (e) {
                e.preventDefault();
                const $target = $(e.target);
                const url = $target.data("preview-url");
                const width = $target.data("preview-width");
                const height = $target.data("preview-height");
                const shortLabel = $target.data("preview-shortlabel");
                const windowFeatures = width != '-1' && height != '-1' ? `resizable,height=${height},width=${width}` : `resizable,height=${screen.height},width=${screen.width}`;
                if (url) {
                    window.open(url, shortLabel, windowFeatures);
                } else {
                    console.error("Can't open preview window.")
                }

            });
        }
    };


})(jQuery, Drupal, drupalSettings);
