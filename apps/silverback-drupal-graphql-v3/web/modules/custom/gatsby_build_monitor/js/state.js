(function ($) {
  function getState() {
    $.ajax({
      type: "post",
      url: Drupal.url("gatsby-build-monitor/get-state"),
      success: function (state) {
        $(".gatsby-build-monitor-state").text("Gatsby Preview state: " + state);
      },
      error: function () {
        $(".gatsby-build-monitor-state").text("Gatsby Preview state: error");
      },
    });
  }
  setInterval(getState, 2000);
})(jQuery);
