<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\DataProducer;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Returns the language of the given path based on prefix.
 *
 * @DataProducer(
 *   id = "url_language",
 *   name = @Translation("Url language"),
 *   description = @Translation("Extract the language from the url prefix."),
 *   produces = @ContextDefinition("string",
 *     label = @Translation("Language")
 *   ),
 *   consumes = {
 *     "url" = @ContextDefinition("any",
 *       label = @Translation("Url")
 *     )
 *   }
 * )
 */
class UrlLanguage extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * {@inheritdoc}
   *
   * @codeCoverageIgnore
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('language_manager'),
      $container->get('config.factory')
    );
  }

  /**
   * UrlLanguage constructor.
   *
   * @param array $configuration
   *   The plugin configuration.
   * @param string $plugin_id
   *   The plugin id.
   * @param mixed $plugin_definition
   *   The plugin definition.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   *
   * @codeCoverageIgnore
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    LanguageManagerInterface $language_manager,
    ConfigFactoryInterface $config_factory
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->languageManager = $language_manager;
    $this->configFactory = $config_factory;
  }

  /**
   * Resolver.
   *
   * @param \Drupal\Core\Url|mixed $url
   *   The URL to get the route entity from.
   *
   * @return string|null
   */
  public function resolve($url) {

    // Warning: use this only with the modified version of the #3314941 patch.
    // The modified version can be found in silverback-template.

    $langcode = $this->languageManager->getDefaultLanguage()->getId();

    $language = $url->getOption('language');
    if ($language) {
      $langcode = $language->getId();
    }
    else {
      $prefixes = $this->configFactory->get('language.negotiation')->get('url.prefixes');
      $path = $url->toString(TRUE)->getGeneratedUrl();
      foreach ($prefixes as $prefix) {
        if ($prefix && str_starts_with($path, "/{$prefix}/")) {
          $langcode = $prefix;
          break;
        }
      }

    }
    return $langcode;
  }

}
