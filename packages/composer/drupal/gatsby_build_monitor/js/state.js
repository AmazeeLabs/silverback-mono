/* global jQuery, Drupal, drupalSettings */
(function ($, Drupal, drupalSettings) {
  var interval = null;
  function getState() {
    if (document.hidden) {
      return;
    }
    $.ajax({
      type: 'post',
      url: Drupal.url('gatsby-build-monitor/get-state'),
      success: function (data) {
        var text;
        var progressBar;
        var buildPercentage;
        var buildDuration;
        switch (data.state) {
          case 'idle':
            text = Drupal.t('Website is ready');
            $('.build-monitor-progress').html('');
            clearInterval(interval);
            break;
          case 'building':
            text = Drupal.t('Website is building');
            if (data.currentTime && data.timestamp && data.averageBuildDuration) {
              // As the build duration is only an estimate, it could happen that
              // the current build would take more than the average, in which
              // case we will just consider the average as being the maximum
              // possible value for the build duration. This has the side effect
              // that the process could just stay at 100% for more time.
              buildDuration = Math.min(data.averageBuildDuration, data.currentTime - data.timestamp);
              buildPercentage = buildDuration * 100 / data.averageBuildDuration;
              progressBar = '<div class="monitor-progress-border"><div class="monitor-progress-bar" style="width: ' + buildPercentage + '%"></div></div>'
              $('.build-monitor-progress').html(progressBar);
            }
            break;
          case 'failure':
            text = Drupal.t('Website build failed');
            $('.build-monitor-progress').html('');
            clearInterval(interval);
            break;
          default:
            text = Drupal.t('Website status is unknown');
            $('.build-monitor-progress').html('');
            clearInterval(interval);
        }
        var $state = $('.gatsby-build-monitor-state');
        $state.text(text);
        if (data.timestamp) {
          $state.attr(
            'title',
            new Date(data.timestamp * 1000).toLocaleString(),
          );
        } else {
          $state.removeAttr('title');
        }
      },
      error: function () {
        var $state = $('.gatsby-build-monitor-state');
        $state.text(Drupal.t('Website status is unknown'));
        $state.removeAttr('title');
      },
    });
  }
  if (
    !window.localStorage.getItem('gatsby_build_monitor_disable') &&
    drupalSettings.gatsbyBuildMonitor.autoRefresh
  ) {
    interval = setInterval(getState, 2000);
  }
})(jQuery, Drupal, drupalSettings);
