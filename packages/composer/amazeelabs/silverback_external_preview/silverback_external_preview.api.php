<?php

function hook_silverback_external_preview_url_alter(
  \Drupal\Core\Url &$url
) {
  if (preg_match('#^/media/([0-9]+)/edit$#', $url, $matches)) {
    // For example, turn $url into a direct file link.
  }
}

function hook_silverback_external_preview_live_url_alter(
  \Drupal\Core\Url &$url
) {
  if (preg_match('#^/media/([0-9]+)/edit$#', $url, $matches)) {
    // For example, turn $url into a direct file link.
  }
}
