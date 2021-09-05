(function ($, Drupal, drupalSettings) {
  "use strict";

  function removeIframeFromUrl(url) {
    // This is a simple implementation which does not consider hash and edge
    // cases. But it should be enough.
    return url
      .replace(/\?iframe=true$/, "")
      .replace(/\?iframe=true&/, "?")
      .replace(/&iframe=true$/, "")
      .replace(/&iframe=true&/, "&");
  }

  function prependBaseUrl(url, baseUrl) {
    // Again, a very simple implementation which only considers relative paths
    // starting from a slash.
    if (url.indexOf("/") === 0 && url.indexOf("//") !== 0) {
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
    waitForParentIframe(function (parentIFrame) {
      var command = drupalSettings.iframeCommand;
      if (command.action === "redirect") {
        command = $.extend(true, {}, command, {
          path: removeIframeFromUrl(command.path),
        });
      }
      parentIFrame.sendMessage(command, "*");
    });
    return;
  }

  // Fallback behavior: get the redirect/messages from the page content.
  Drupal.behaviors.silverbackIframeRedirect = {
    attach: function (context) {
      // Check if there is a link with class `.js-iframe-parent-message`.
      var $messageElements = $(".js-iframe-parent-message", context);

      // Check if there is a link with class `.js-iframe-parent-redirect` in
      // the current content, and trigger a parent redirect to that path.
      var $redirectLinkElement = $(".js-iframe-parent-redirect", context);
      if ($redirectLinkElement.length > 0) {
        var redirectLink = $redirectLinkElement.get(0).pathname;
        waitForParentIframe(function (parentIFrame) {
          parentIFrame.sendMessage(
            {
              action: "redirect",
              path: redirectLink,
              messages: $messageElements.toArray().map(function (el) {
                return el.innerText;
              }),
            },
            "*"
          );
        });
      }
    },
  };

  // Ask parent for the base URL to adjust links.
  waitForParentIframe(function (parentIFrame) {
    parentIFrame.sendMessage({ action: "getBaseUrl" }, "*");
  });

  // Update links using the given base URL.
  window.addEventListener("message", (event) => {
    // The message looks like this:
    // [iFrameSizer]message:"silverback-iframe-base-url:http://localhost:8000"
    var prefix = '[iFrameSizer]message:"silverback-iframe-base-url:';
    if (typeof event.data !== "string" || event.data.indexOf(prefix) !== 0) {
      return;
    }
    var baseUrl = event.data.substr(
      prefix.length,
      event.data.length - prefix.length - 1
    );
    $("a:visible").each(function () {
      var $this = $(this);
      var href = $this.attr("href");
      if (!href) {
        return true;
      }
      // 1. Remove "iframe=true" from the URL.
      href = removeIframeFromUrl(href);
      // 2. Use parent frame base URL for relative links.
      href = prependBaseUrl(href, baseUrl);
      $this.attr("href", href);
      // 3. Open links in parent frame.
      if ($this.attr("target") !== "_blank") {
        $this.attr("target", "_parent");
      }
      return true;
    });
    // This class is used by integration tests.
    $("body").addClass("silverback-iframe-links-processed");
  });
})(jQuery, Drupal, drupalSettings);
