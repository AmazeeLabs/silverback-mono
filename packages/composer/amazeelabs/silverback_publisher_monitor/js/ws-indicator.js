(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.silverbackMonitorIndicator = {
    attach: function (context, settings) {
      const publisherSocket = new WebSocket(
        drupalSettings.publisherUpdateWebsocketUrl,
      );
      publisherSocket.onmessage = (event) => {
        var message = '';
        switch (event.data.toString()) {
          case '"starting"':
            message = '🏃 Running';
            break;
          case '"fatal"':
            message = '😱 Error';
            break;
          case '"updating"':
            message = '♻️ Updating';
            break;
          case '"ready"':
            message = '✅ Up-to-date';
            break;
          default:
            message = '❓ Unknown';
            break;
        }
        $indicator = $('.silverback-publisher__monitor-indicator');
        $indicator.on('click', (event) => {
          event.preventDefault();
        });
        $indicator.text(message);
      };
    },
  };
})(jQuery, Drupal, drupalSettings);
