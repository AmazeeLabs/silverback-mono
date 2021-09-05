<?php

namespace Drupal\silverback_iframe\PathProcessor;

use Drupal\Core\PathProcessor\OutboundPathProcessorInterface;
use Drupal\Core\Render\BubbleableMetadata;
use Symfony\Component\HttpFoundation\Request;

class SilverbackIframePathProcessor implements OutboundPathProcessorInterface {

  public function processOutbound($path, &$options = [], Request $request = NULL, BubbleableMetadata $bubbleable_metadata = NULL) {
    if (silverback_iframe_theme_enabled()) {
      $options['query']['iframe'] = 'true';
    }
    return $path;
  }

}
