(function ($) {
  function getState() {
    $.ajax({
      type: "post",
      url: Drupal.url("gatsby-build-monitor/get-state"),
      success: function (state) {
        var text;
        switch (state) {
          case "idle":
            text = Drupal.t("Gatsby is ready");
            break;
          case "building":
            text = Drupal.t("Gatsby is building");
            break;
          default:
            text = Drupal.t("Gatsby status is unknown");
        }
        $(".gatsby-build-monitor-state").text(text);
      },
      error: function () {
        $(".gatsby-build-monitor-state").text(
          Drupal.t("Gatsby status is unknown")
        );
      },
    });
  }
  setInterval(getState, 2000);
})(jQuery);
