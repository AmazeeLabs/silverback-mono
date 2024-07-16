(function (Drupal) {
  Drupal.behaviors.previewLinkCopyToClipBoard = {
    attach: function (context) {
      const copyText = document.querySelector('.preview-link__copy .form-text');
      const copyButton = document.querySelector('.preview-link__copy button');
      const copyResult = document.querySelector(
        '.preview-link__copy .form-item__description',
      );

      if (!copyText || !copyButton || !copyResult) {
        return;
      }
      const setSuccessMessage = () => {
        const copySuccessMessage = Drupal.t('Link copied ✨ ready to share!');
        copyResult.textContent = copySuccessMessage;
        setTimeout(() => {
          copyResult.textContent = ' ';
        }, 3000);
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
            (err) => (copyResult.textContent = 'Error: ' + err),
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
