<?php

namespace Drupal\silverback_iframe\Theme;

use Drupal\Core\Extension\ThemeExtensionList;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Theme\ThemeNegotiatorInterface;

class SilverbackIframeThemeNegotiator implements ThemeNegotiatorInterface {

  protected ThemeExtensionList $themeExtensionList;

  public function __construct(ThemeExtensionList $themeExtensionList) {
    $this->themeExtensionList = $themeExtensionList;
  }


  public function applies(RouteMatchInterface $route_match) {
    return silverback_iframe_theme_enabled();
  }

  public function determineActiveTheme(RouteMatchInterface $route_match) {
    foreach ($this->themeExtensionList->getAllInstalledInfo() as $theme => $info) {
      if (($info['base theme'] ?? NULL) === 'silverback_iframe_theme') {
        return $theme;
      }
    }
    return 'silverback_iframe_theme';
  }

}
