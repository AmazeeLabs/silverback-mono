<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\locale\StringStorageInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 *
 * Loads a single string or translated string.
 *
 * @DataProducer(
 *   id = "fetch_translatable_string",
 *   name = @Translation("Fetch translatable string"),
 *   description = @Translation("Loads a single translatable string."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("String")
 *   ),
 *   consumes = {
 *     "id" = @ContextDefinition("string",
 *       label = @Translation("Identifier"),
 *       required = FALSE
 *     ),
 *     "language" = @ContextDefinition("string",
 *       label = @Translation("Language"),
 *       required = FALSE
 *     )
 *   }
 * )
 */
class FetchTranslatableString extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The locale storage service.
   *
   * @var \Drupal\locale\StringStorageInterface
   */
  protected $localeStorage;

  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    StringStorageInterface $locale_storage
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->localeStorage = $locale_storage;
  }

  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('locale.storage')
    );
  }

  public function resolve($id, $language, FieldContext $context) {
    $strings = $this->localeStorage->getTranslations([
      'lid' => $id,
      'language' => $language,
    ]);
    // Make sure the result clears when new translations are added.
    $context->addCacheTags(['locale']);
    if (!empty($strings)) {
      return reset($strings);
    }
    return NULL;
  }
}
