<?php

namespace Drupal\silverback_translations;

/**
 * Interface for the translations processor classes.
 */
interface TranslationsProcessorInterface {

  /**
   * Creates new translations in the system.
   *
   * @param string $json_sources
   *  A JSON object containing the translation sources. The keys will represent
   *  the translation source.
   * @param string $context
   *  The context in which the translations should be created.
   */
  public function createSources($json_sources, $context);

}
