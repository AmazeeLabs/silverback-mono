<?php

namespace Drupal\silverback_gatsby\Plugin\Gatsby\Feed;

use Drupal\content_translation\ContentTranslationManagerInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManager;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\TranslatableInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\TypedData\TypedData;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerProxy;
use Drupal\silverback_gatsby\Annotation\GatsbyFeed;
use Drupal\silverback_gatsby\Plugin\FeedBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Feed plugin that creates Gatsby feeds based on Drupal entities.
 *
 * @GatsbyFeed(
 *   id = "entity"
 * )
 */
class EntityFeed extends FeedBase implements ContainerFactoryPluginInterface {

  /**
   * The target entity type.
   *
   * @var string
   */
  protected string $type;

  /**
   * The target entity bundle.
   *
   * @var string
   */
  protected string $bundle;


  /**
   * {@inheritDoc}
   */
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
      $container->get('content_translation.manager'),
      $container->get('entity_field.manager')
    );
  }

  /**
   * {@inheritDoc}
   */
  public function __construct(
    $config,
    $plugin_id,
    $plugin_definition,
    ContentTranslationManagerInterface $contentTranslationManager,
    EntityFieldManagerInterface $entityFieldManager
  ) {
    $type = $config['type'];
    $bundle = $config['bundle'];
    $this->type = $type;
    $this->bundle = $bundle;

    // Only entities with a "changed" field are diffable.
    // TODO: Auto-extend entities to have a changed field?
    $diffable = count(array_filter(
      $entityFieldManager->getBaseFieldDefinitions($type),
      function (FieldDefinitionInterface $definition) {
        return $definition->getName() === 'changed';
      })) > 0;

    // Check if translation is enabled for this type.
    $translatable = $contentTranslationManager->isEnabled($type, $bundle);
    parent::__construct(
      $config,
      $plugin_id,
      $plugin_definition,
      $diffable,
      $translatable
    );
  }

  /**
   * {@inheritDoc}
   */
  public function resolveItem(): DataProducerProxy {
    return $this->builder->produce('entity_load')
      ->map('type', $this->builder->fromValue($this->type))
      ->map('bundles', $this->builder->fromValue([$this->bundle]))
      ->map('id', $this->builder->fromArgument('id'));
  }

  /**
   * {@inheritDoc}
   */
  public function resolveChanges(): DataProducerProxy {
    return $this->builder->produce('entity_changes')
      ->map('type', $this->builder->fromValue($this->type))
      ->map('bundle', $this->builder->fromValue($this->bundle))
      ->map('since', $this->builder->fromArgument('since'))
      ->map('ids', $this->builder->fromArgument('ids'));
  }

  /**
   * {@inheritDoc}
   */
  public function resolveItems(): DataProducerProxy {
    return $this->builder->produce('list_entities')
      ->map('type', $this->builder->fromValue($this->type))
      ->map('bundle', $this->builder->fromValue($this->bundle))
      ->map('offset', $this->builder->fromArgument('offset'))
      ->map('limit', $this->builder->fromArgument('limit'));
  }

  /**
   * {@inheritDoc}
   */
  public function resolveId(): DataProducerProxy {
    return $this->builder->produce('entity_id')
      ->map('entity', $this->builder->fromParent());
  }

  /**
   * {@inheritDoc}
   */
  public function resolveLangcode(): ResolverInterface {
    return $this->builder->callback(
      fn(TranslatableInterface $value) => $value->language()->getId()
    );
  }

  /**
   * {@inheritDoc}
   */
  public function resolveTranslations(): DataProducerProxy {
    return $this->builder->produce('entity_translations')
      ->map('entity', $this->builder->fromParent());
  }
}
