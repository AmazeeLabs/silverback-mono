<?php

use \Drupal\Core\Routing\RouteMatchInterface;

function hook_silverback_external_preview_url_alter(RouteMatchInterface $routeMatch, &$url) {
  // For example, turn $url into a direct file link.
  $params = $routeMatch->getParameters()->all();
  if (isset($params['media'])) {
    $media = $params['media'];
    $fid = $media->getSource()->getSourceFieldValue($media);
    $file = File::load($fid);
    $url = $file->createFileUrl();
  }
}
