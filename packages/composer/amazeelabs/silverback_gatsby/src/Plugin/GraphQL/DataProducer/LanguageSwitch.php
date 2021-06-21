<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StringTranslation\Translator\TranslatorInterface;
use Drupal\graphql\EventSubscriber\CurrentLanguageResetTrait;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\language\LanguageNegotiatorInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * TODO: This should be supported by the GraphQL module.
 *
 * @DataProducer(
 *   id = "language_switch",
 *   name = @Translation("Switch language"),
 *   consumes = {
 *     "language" = @ContextDefinition("string",
 *       label = @Translation("Language"),
 *       required = TRUE,
 *     ),
 *   },
 * )
 */
class LanguageSwitch extends DataProducerPluginBase implements ContainerFactoryPluginInterface {
  use CurrentLanguageResetTrait;
  use DependencySerializationTrait;

  public static function create(
    ContainerInterface $container,
    array $configuration,
    $plugin_id,
    $plugin_definition
  ) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('language_manager'),
      $container->get('language_negotiator'),
      $container->get('string_translator.custom_strings'),
      $container->get('current_user')
    );
  }

  public function __construct(
    array $configuration,
    $pluginId,
    $pluginDefinition,
    LanguageManagerInterface $languageManager,
    LanguageNegotiatorInterface $languageNegotiator,
    TranslatorInterface $translator,
    AccountInterface $currentUser
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->languageManager = $languageManager;
    $this->languageNegotiator = $languageNegotiator;
    $this->translator = $translator;
    $this->currentUser = $currentUser;
  }

  public function resolve(string $language, FieldContext $fieldContext) {
    $fieldContext->setContextLanguage($language);
    $this->resetLanguageContext();
  }

}
