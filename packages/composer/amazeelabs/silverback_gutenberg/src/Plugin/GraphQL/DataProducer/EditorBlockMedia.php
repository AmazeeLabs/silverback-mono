<?php

namespace Drupal\silverback_gutenberg\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\layout_builder_fieldblock_test\ContextProvider\FakeViewModeContext;
use Drupal\media\Entity\Media;


/**
 * Resolves a media entity attached to an editor block.
 *
 * @DataProducer(
 *   id = "editor_block_media",
 *   name = @Translation("Editor blockmedia"),
 *   description = @Translation("Resolve the media item attached to an editor block."),
 *   produces = @ContextDefinition("entity:media",
 *     label = @Translation("The media item")
 *   ),
 *   consumes = {
 *     "block" = @ContextDefinition("any",
 *       label = @Translation("A parsed editor block")
 *     )
 *   }
 * )
 */
class EditorBlockMedia extends DataProducerPluginBase {
  public function resolve(
    $block,
    FieldContext $field
  ) {
    $mediaId = $block['attrs']['mediaEntityIds'][0] ?? NULL;

    if (!$mediaId) {
      return NULL;
    }
    $media = Media::load($mediaId);
    // Try to get the embedded item in the current language or use whatever
    // we get as a fallback.
    if (!$media) {
      \Drupal::logger('graphql_gutenberg')->notice("Cannot load media by ID '{$mediaId}'");
      return NULL;
    }
    $documentLanguage = $field->getContextValue('document_language');
    if ($media->hasTranslation($documentLanguage)) {
      $media = $media->getTranslation($documentLanguage);
    }
    if ($media) {
      $field->addCacheableDependency($media);
    }
    return $media;
  }

}
