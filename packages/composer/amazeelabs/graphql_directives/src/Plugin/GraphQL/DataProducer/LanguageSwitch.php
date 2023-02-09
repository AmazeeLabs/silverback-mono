<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\DataProducer;

use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StringTranslation\Translator\TranslatorInterface;
use Drupal\Core\TypedData\TranslatableInterface;
use Drupal\graphql\EventSubscriber\CurrentLanguageResetTrait;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\language\LanguageNegotiatorInterface;
use GraphQL\Deferred;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @DataProducer(
 *   id = "language_switch",
 *   name = @Translation("Switch language"),
 *   consumes = {
 *     "language" = @ContextDefinition("any",
 *       label = @Translation("Language or translatable object"),
 *       required = TRUE
 *     )
 *   }
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

  public function resolve($language, FieldContext $fieldContext) {
    if ($language instanceof TranslatableInterface || $language instanceof EntityInterface) {
      $fieldContext->setContextLanguage($language->language()->getId());
    }
    if (is_string($language)) {
      $fieldContext->setContextLanguage($language);
    }
    $this->resetLanguageContext();
  }

}
