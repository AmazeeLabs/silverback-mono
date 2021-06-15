(function ($) {
  function getState() {
    $.ajax({
      type: "post",
      url: Drupal.url("gatsby-build-monitor/get-state"),
      success: function (data) {
        var text;
        switch (data.state) {
          case "idle":
            text = Drupal.t("Website is ready");
            break;
          case "building":
            text = Drupal.t("Website is building");
            break;
          case "failure":
            text = Drupal.t("Website build failed");
            break;
          default:
            text = Drupal.t("Website status is unknown");
        }
        var $state = $(".gatsby-build-monitor-state");
        $state.text(text);
        if (data.timestamp) {
          $state.attr(
            "title",
            new Date(data.timestamp * 1000).toLocaleString()
          );
        } else {
          $state.removeAttr("title");
        }
      },
      error: function () {
        var $state = $(".gatsby-build-monitor-state");
        $state.text(Drupal.t("Website status is unknown"));
        $state.removeAttr("title");
      },
    });
  }
  if (!window.localStorage.getItem("gatsby_build_monitor_disable")) {
    setInterval(getState, 2000);
  }
})(jQuery);
