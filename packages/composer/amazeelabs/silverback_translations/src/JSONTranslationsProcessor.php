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
  public function createSources($json_sources, $context, $defaultTranslationLanguage) {
    $sources = json_decode($json_sources, TRUE);
    if (!empty($sources)) {
      foreach ($sources as $source => $defaultTranslation) {
        // Make sure that we do not have already a string with the same source
        // and context. We add a new string and a default translation only if
        // there is no existing string.
        $existingString = $this->localeStorage->getStrings([
          'source' => $source,
          'context' => $context,
        ]);
        if (!empty($existingString)) {
          continue;
        }

        // First, create a string.
        $string = $this->localeStorage->createString([
          'source' => $source,
          'context' => $context,
        ])->save();

        // Second, add a default translation, if a default message is provided.
        if ($defaultTranslation['defaultMessage']) {
          $this->localeStorage->createTranslation([
            'lid' => $string->getId(),
            'language' => $defaultTranslationLanguage,
            'translation' => $defaultTranslation['defaultMessage'],
            'customized' => 1,
          ])->save();
        }
      }
    }
  }
}
