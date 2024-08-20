(function (Drupal) {
  Drupal.behaviors.previewLinkCopyToClipBoard = {
    attach: function (context) {
      const copyText = document.querySelector('.preview-link__copy .form-text');
      const copyButton = document.querySelector('.preview-link__copy button');

      if (!copyText || !copyButton) {
        return;
      }

      const setSuccessMessage = () => {
        const originalLabel = copyButton.textContent;
        const copySuccessLabel = Drupal.t('Copied ✨');
        copyButton.textContent = copySuccessLabel;
        setTimeout(() => {
          copyButton.textContent = originalLabel;
        }, 2000);
      };
      // Fallback for browsers that don't support navigator.clipboard.
      let copy = () => {
        copyText.select();
        document.execCommand('copy');
        setSuccessMessage();
      };
      if (navigator.clipboard) {
        copy = () => {
          navigator.clipboard.writeText(copyText.value).then(
            () => setSuccessMessage(),
            (err) => console.log('Error: ' + err),
          );
        };
      }
      copyButton.addEventListener('click', (event) => {
        event.preventDefault();
        copy();
      });
    },
  };
})(Drupal);
