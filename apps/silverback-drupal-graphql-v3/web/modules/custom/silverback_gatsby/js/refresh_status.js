(function ($) {
  function getIsRefreshing() {
    $.ajax({
      type: "post",
      url: drupalSettings.isGatsbyRefreshingUrl,
      success: function (isRefreshing) {
        $(".silverback-gatsby-preview-refresh-status-link").text(
          "Gatsby Preview status: " + (isRefreshing ? "Rebuilding" : "Idle")
        );
      },
      error: function () {
        $(".silverback-gatsby-preview-refresh-status-link").text(
          "Gatsby Preview status: Unknown"
        );
      },
    });
  }
  setInterval(getIsRefreshing, 2_000);
  getIsRefreshing();
})(jQuery);
