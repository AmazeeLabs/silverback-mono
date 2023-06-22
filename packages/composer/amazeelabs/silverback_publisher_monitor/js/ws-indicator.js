(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.silverbackMonitorIndicator = {
    // Fine to use ES6 here without transpiling
    // see https://www.drupal.org/project/drupal/issues/2957390#comment-14686455
    attach: function (context, settings) {
      const processingImage = ` <svg
        class="spinning icon"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="transparent"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>`;

      const errorImage = `<svg
        class="icon"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>`;

      const doneImage = `<svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>`;

      const publisherSocket = new WebSocket(
        drupalSettings.publisherUpdateWebsocketUrl,
      );
      publisherSocket.onmessage = (event) => {
        let icon = '';
        let message = '';
        switch (event.data.toString()) {
          case '"starting"':
            icon = processingImage;
            message = 'Starting';
            break;
          case '"updating"':
            icon = processingImage;
            message = 'Updating';
            break;
          case '"ready"':
            icon = doneImage;
            message = 'Up-to-date';
            break;
          case '"error"':
          case '"fatal"':
            icon = errorImage;
            message = 'Error';
            break;
          default:
            icon = errorImage;
            message = 'Unknown status';
            break;
        }
        $indicator = $('.silverback-publisher__monitor-indicator');
        $indicator.on('click', (event) => {
          event.preventDefault();
        });

        const output = `<div class="wrapper">
          <div class="icon">${icon}</div>
          <div>${message}</div>
        </div>`;
        $indicator.html(output);
      };
    },
  };
})(jQuery, Drupal, drupalSettings);
