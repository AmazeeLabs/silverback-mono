(function (Drupal) {
  Drupal.behaviors.previewLinkShare = {
    attach: function (context) {
      const shareWrapper = document.querySelector('.preview-link__share');
      const shareButton = document.querySelector('.preview-link__share button');
      const shareResult = document.querySelector('.preview-link__share-result');
      if (!navigator.share) {
        shareWrapper.style.display = 'none';
        return;
      } else {
        shareWrapper.style.display = 'inherit';
      }
      shareButton.addEventListener('click', (event) => {
        event.preventDefault();
        const shareData = {
          title: shareButton.dataset.title || Drupal.t('Preview'),
          text: shareButton.dataset.text,
          url: shareButton.dataset.url,
        };
        navigator
          .share(shareData)
          .then(() => (shareResult.textContent = Drupal.t('Preview shared')))
          .catch((e) => (shareResult.textContent = 'Error: ' + e));
      });
    },
  };
})(Drupal);
