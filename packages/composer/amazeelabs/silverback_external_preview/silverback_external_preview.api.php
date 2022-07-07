<?php

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Url;

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

function hook_silverback_external_preview_entity_url_alter(ContentEntityInterface $entity, Url &$url) {
  // Alters entity preview url.
}
