<?php

namespace Drupal\silverback_gutenberg\Service;

use Drupal\gutenberg\Service\MediaService as Original;
use Drupal\media_library\MediaLibraryState;

class MediaService extends Original {

  public function renderDialog(array $media_types, array $media_bundles = NULL) {
    // Instead of guessing media types as the parent method does, use given
    // media types as media type IDs. So the blocks have full control over
    // allowed media types.
    // The default behavior is: get bundles by $media_types, then intersect them
    // with $media_bundles.
    // New behavior is: get bundles from $media_types, so we don't break
    // projects using this module.
    $media_bundles = $media_types;

    $buildUi = $this->builder->buildUi(
      MediaLibraryState::create('gutenberg.media_library.opener', array_unique($media_bundles), reset($media_bundles), 1)
    );
    $this->moduleHandler->alter('gutenberg_media_library_view', $buildUi);
    return $this->renderer->render($buildUi);
  }

}
