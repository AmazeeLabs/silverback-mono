<?php

namespace Drupal\silverback_gutenberg\Service;

use Drupal\gutenberg\Service\MediaService as Original;
use Drupal\media_library\MediaLibraryState;

class MediaService extends Original {

  public function renderDialog(array $media_types) {
    // Instead of guessing media types as the parent method does, use given
    // media types as media type IDs. So the blocks have full control over
    // allowed media types.
    // This behavior is proposed here:
    // https://www.drupal.org/project/gutenberg/issues/3107837#comment-14119332
    $allowed_media_type_ids = $media_types;

    $buildUi = $this->builder->buildUi(
      MediaLibraryState::create('gutenberg.media_library.opener', array_unique($allowed_media_type_ids), reset($allowed_media_type_ids), 1)
    );
    $this->moduleHandler->alter('gutenberg_media_library_view', $buildUi);
    return $this->renderer->render($buildUi);
  }

}
