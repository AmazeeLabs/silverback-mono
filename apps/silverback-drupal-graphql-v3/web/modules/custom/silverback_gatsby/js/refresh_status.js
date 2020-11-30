(function ($) {
  setInterval(() => {
    $.ajax({
      type: "post",
      url: drupalSettings.isGatsbyRefreshingUrl,
      success: function (data) {
        $(".silverback-gatsby-preview-refresh-status-link").text(
          "Gatsby Preview status: " + (data ? "Rebuilding" : "Idle")
        );
      },
      error: function () {
        $(".silverback-gatsby-preview-refresh-status-link").text(
          "Gatsby Preview status: Unknown"
        );
      },
    });
  }, 2_000);
})(jQuery);
