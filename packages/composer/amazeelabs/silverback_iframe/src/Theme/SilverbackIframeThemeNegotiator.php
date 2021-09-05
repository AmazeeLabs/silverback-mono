<?php

namespace Drupal\silverback_iframe\Theme;

use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Theme\ThemeNegotiatorInterface;

class SilverbackIframeThemeNegotiator implements ThemeNegotiatorInterface {

  public function applies(RouteMatchInterface $route_match) {
    return silverback_iframe_theme_enabled();
  }

  public function determineActiveTheme(RouteMatchInterface $route_match) {
    return 'silverback_iframe_theme';
  }

}
