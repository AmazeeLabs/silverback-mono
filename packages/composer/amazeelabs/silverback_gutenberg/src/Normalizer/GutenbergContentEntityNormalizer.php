<?php

namespace Drupal\silverback_gutenberg\Normalizer;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\default_content\Normalizer\ContentEntityNormalizer;
use Drupal\gutenberg\Parser\BlockParser;
use Drupal\node\Entity\Node;
use Drupal\silverback_gutenberg\BlockMutator\MediaIdToUuidBlockMutator;
use Drupal\silverback_gutenberg\BlockMutator\MediaUuidToIdBlockMutator;
use Drupal\silverback_gutenberg\BlockProcessor;
use Drupal\silverback_gutenberg\BlockSerializer;
use Drupal\silverback_gutenberg\MediaScanner;
use Drupal\silverback_gutenberg\Utils;

/**
 * Class GutenbergContentEntityNormalizer
 *
 * Override for the ContentEntityNormalizer in default_content, replacing referenced
 * media entity id's with uuids, so they can be imported and exported reliably.
 *
 * @package Drupal\silverback_gutenberg\Normalizer
 */
class GutenbergContentEntityNormalizer extends ContentEntityNormalizer {

  /**
   * {@inheritDoc}
   */
  protected function normalizeTranslation(ContentEntityInterface $entity, array $field_names) {
    $idToUuidMutator = new MediaIdToUuidBlockMutator($this->entityRepository);
    $processor = new BlockProcessor($idToUuidMutator);

    foreach (Utils::getGutenbergFields($entity) as $field) {
      $field = $entity->get($field);
      if (is_string($field->value)) {
        // Parse the document, mutate it and re-assign it as the field value.
        $blocks = (new BlockParser())->parse($field->value);
        $processor->mutate($blocks);
        $field->value = (new BlockSerializer())->serialize_blocks($blocks);
        foreach ((new MediaScanner())->extract($field->value) as $uuid) {
          $this->dependencies[$uuid] = 'media';
        }
      }
    }

    // Pass the modified entity to the actual normalization.
    return parent::normalizeTranslation($entity, $field_names);
  }

  /**
   * {@inheritDoc}
   */
  public function denormalize(array $data) {
    // Abort early if the current entity is not a node.
    if (!isset($data['_meta']['entity_type']) || $data['_meta']['entity_type'] !== 'node') {
      return parent::denormalize($data);
    }

    $uuidToIdMutator = new MediaUuidToIdBlockMutator($this->entityRepository);
    $processor = new BlockProcessor($uuidToIdMutator);

    // Create an empty instance of that entity to easily get the relevant
    // field names.
    $entity = Node::create(['type' => $data['_meta']['bundle']]);
    foreach (Utils::getGutenbergFields($entity) as $field) {
      if (is_string($data['default'][$field][0]['value'])) {
        // Parse the document, mutate it and re-assign it as the payload.
        $blocks = (new BlockParser())->parse($data['default'][$field][0]['value']);
        $processor->mutate($blocks);
        $data['default'][$field][0]['value'] = (new BlockSerializer())->serialize_blocks($blocks);
      }
      if (isset($data['translations'])) {
        foreach(array_keys($data['translations']) as $langcode) {
          // Parse the translation document, mutate it and re-assign it as the payload.
          $blocks = (new BlockParser())->parse($data['translations'][$langcode][$field][0]['value']);
          $processor->mutate($blocks);
          $data['translations'][$langcode][$field][0]['value'] = (new BlockSerializer())->serialize_blocks($blocks);
        }
      }
    }

    // Pass the modified payload to the actual denormalization.
    return parent::denormalize($data);
  }
}
