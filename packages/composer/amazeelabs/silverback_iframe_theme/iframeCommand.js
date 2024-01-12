(function ($, Drupal, drupalSettings) {
  'use strict';

  function removeIframeFromUrl(url) {
    // This is a simple implementation which does not consider hash and edge
    // cases. But it should be enough.
    return url
      .replace(/\?iframe=true$/, '')
      .replace(/\?iframe=true&/, '?')
      .replace(/&iframe=true$/, '')
      .replace(/&iframe=true&/, '&');
  }

  function prependBaseUrl(url, baseUrl) {
    // Again, a very simple implementation which only considers relative paths
    // starting from a slash.
    if (url.indexOf('/') === 0 && url.indexOf('//') !== 0) {
      return baseUrl + url;
    }
  }

  function waitForParentIframe(callback) {
    // Wait until `window.parentIFrame` has been populated by iframe resizer.
    var interval;
    function execute() {
      if (window.parentIFrame) {
        if (interval) {
          window.clearInterval(interval);
        }
        callback(window.parentIFrame);
      }
    }
    execute();
    interval = window.setInterval(execute, 100);
  }

  // Pass the iframe command to the parent iframe.
  if (drupalSettings.iframeCommand) {
    var iframeCommands = !Array.isArray(drupalSettings.iframeCommand)
      ? new Array(drupalSettings.iframeCommand)
      : drupalSettings.iframeCommand;
    if (iframeCommands.length > 0) {
      waitForParentIframe(function (parentIFrame) {
        iframeCommands.forEach(function (iframeCommand) {
          var command = iframeCommand;
          if (command.action === 'redirect') {
            command = $.extend(true, {}, command, {
              path: removeIframeFromUrl(command.path),
            });
          }
          parentIFrame.sendMessage(command, '*');
        });
      });
      return;
    }
  }

  // Fallback behavior: get the redirect/messages from the page content.
  Drupal.behaviors.silverbackIframeRedirect = {
    attach: function (context) {
      // Check if there is a link with class `.js-iframe-parent-message`.
      var $messageElements = $('.js-iframe-parent-message', context);

      // Check if there is a link with class `.js-iframe-parent-redirect` in
      // the current content, and trigger a parent redirect to that path.
      var $redirectLinkElement = $('.js-iframe-parent-redirect', context);
      if ($redirectLinkElement.length > 0) {
        var redirectLink = $redirectLinkElement.get(0).pathname;
        waitForParentIframe(function (parentIFrame) {
          parentIFrame.sendMessage(
            {
              action: 'redirect',
              path: redirectLink,
              messages: $messageElements.toArray().map(function (el) {
                return el.innerText;
              }),
            },
            '*',
          );
        });
      }
    },
  };

  waitForParentIframe(function (parentIFrame) {
    parentIFrame.sendMessage({ action: 'init' }, '*');
  });

  var updateBaseUrlInLinks = (baseUrl) => {
    $('a:visible').each(function () {
      var $this = $(this);
      var href = $this.attr('href');
      if (!href) {
        return true;
      }

      // Exclude some links.
      if (
        // Drupal a11y links.
        $this.hasClass('visually-hidden') ||
        // Commerce checkout "Edit" links.
        $this.closest('.checkout-pane-review').length ||
        // Multistep form navigation links.
        $this.closest('.form-actions').length
      ) {
        return true;
      }

      // Process links.
      // 1. Remove "iframe=true" from the URL.
      href = removeIframeFromUrl(href);
      // 2. Use parent frame base URL for relative links.
      href = prependBaseUrl(href, baseUrl);
      $this.attr('href', href);
      // 3. Open links in parent frame.
      if ($this.attr('target') !== '_blank') {
        $this.attr('target', '_parent');
      }
      return true;
    });
    // This class is used by integration tests.
    $('body').addClass('silverback-iframe-links-processed');
  };

  var injectCssStyles = (styles) => {
    var id = 'silverback-iframe-injected-styles';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = styles;
  };

  window.addEventListener('message', (event) => {
    var parsed = parseMessage(event.data);
    if (!parsed) {
      return;
    }
    if (parsed.type === 'init') {
      updateBaseUrlInLinks(parsed.baseUrl);
      if (parsed.injectStyles) {
        injectCssStyles(parsed.injectStyles);
      }
    }
  });

  /**
   *
   * @param {string} message
   * @returns {{type: 'init', baseUrl: string, injectStyles: string | undefined} | null}
   */
  function parseMessage(message) {
    if (typeof message !== 'string') {
      return null;
    }
    var prefix = '[iFrameSizer]message:';
    if (!message.startsWith(prefix)) {
      return null;
    }
    var parsed = null;
    try {
      parsed = JSON.parse(message.substring(prefix.length));
    } catch (e) {
      return null;
    }
    if (
      typeof parsed !== 'object' ||
      typeof parsed.silverbackIframe !== 'object' ||
      parsed.silverbackIframe.type !== 'init'
    ) {
      return null;
    }
    return parsed.silverbackIframe;
  }
})(jQuery, Drupal, drupalSettings);
