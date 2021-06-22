<?php

namespace Drupal\silverback_gutenberg;

use Drupal\webform\WebformMessageManager as Original;

class WebformMessageManager extends Original {

  public function build($key) {
    $build = parent::build($key);

    if (isset($build['#markup'])) {
      /** @var \Drupal\silverback_gutenberg\LinkProcessor $linkProcessor */
      $linkProcessor = \Drupal::service(LinkProcessor::class);

      // Ensure that the redirect links point to correct URLs.
      $build['#markup'] = $linkProcessor->processLinks($build['#markup'], 'inbound');
      $build['#markup'] = $linkProcessor->processLinks(
        $build['#markup'],
        'outbound',
        \Drupal::languageManager()->getCurrentLanguage()
      );
      $build['#cache']['max-age'] = 0;
    }

    return $build;
  }

}
