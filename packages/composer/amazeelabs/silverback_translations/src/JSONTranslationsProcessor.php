<?php

namespace Drupal\silverback_translations;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\locale\StringStorageInterface;

/**
 * A translation processor that is able to create translation sources from a
 * JSON formatted string.
 */
class JSONTranslationsProcessor implements TranslationsProcessorInterface {
  use StringTranslationTrait;

  /**
   * @var StringStorageInterface $localeStorage
   * The locale storage service.
   */
  protected $localeStorage;

  /**
   * JSONTranslationsProcessor constructor.
   */
  public function __construct(StringStorageInterface $locale_storage) {
    $this->localeStorage = $locale_storage;
  }

  /**
   * {@inheritdoc}
   */
  public function createSources($json_sources, $context) {
    $sources = json_decode($json_sources, TRUE);
    if (!empty($sources)) {
      foreach ($sources as $source) {
        // Make sure that we do not have already a string with the same source
        // and context. We add a new source only if there is no existing one.
        $stringContext = $context;
        if (!empty($source['description'])) {
          $stringContext .= ': ' . $source['description'];
        }
        $existingString = $this->localeStorage->getStrings([
          'source' => $source['defaultMessage'],
          'context' => $stringContext,
        ]);
        if (!empty($existingString)) {
          continue;
        }

        $this->localeStorage->createString([
          'source' => $source['defaultMessage'],
          'context' => $stringContext,
        ])->save();
      }
    }
  }
}
