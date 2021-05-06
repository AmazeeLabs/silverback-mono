<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerProxy;

/**
 * Class EntityFeed
 *
 * A Gatsby feed implementation for Drupal entities.
 *
 * @package Drupal\silverback_gatsby
 */
class EntityFeed extends FeedBase {

  protected ResolverBuilder $builder;

  protected string $type;
  protected string $bundle;

  public function __construct(
    string $type,
    string $bundle,
    string $typeName
  ) {
    $this->builder = new ResolverBuilder();
    $this->type = $type;
    $this->bundle = $bundle;
    $translationManager = \Drupal::getContainer()->get('content_translation.manager');
    parent::__construct($typeName, $translationManager->isEnabled($type, $bundle), true);
  }

  protected EntityTypeManagerInterface $entityTypeManager;

  public function id() : string {
    return implode('__', ['entity', $this->type, $this->bundle]);
  }

  public function resolveItem(): DataProducerProxy {
    return $this->builder->produce('entity_load')
      ->map('type', $this->builder->fromValue($this->type))
      ->map('bundles', $this->builder->fromValue([$this->bundle]))
      ->map('id', $this->builder->fromArgument('id'));
  }

  public function resolveChanges(): DataProducerProxy {
    return $this->builder->produce('entity_changes')
      ->map('type', $this->builder->fromValue($this->type))
      ->map('bundle', $this->builder->fromValue($this->bundle))
      ->map('since', $this->builder->fromArgument('since'))
      ->map('ids', $this->builder->fromArgument('ids'));
  }
  public function resolveItems(): DataProducerProxy {
    return $this->builder->produce('list_entities')
      ->map('type', $this->builder->fromValue($this->type))
      ->map('bundle', $this->builder->fromValue($this->bundle))
      ->map('offset', $this->builder->fromArgument('offset'))
      ->map('limit', $this->builder->fromArgument('limit'));
  }

  public function resolveId(): DataProducerProxy {
    return $this->builder->produce('entity_id')
      ->map('entity', $this->builder->fromParent());
  }

  public function resolveTranslations(): DataProducerProxy {
    return $this->builder->produce('entity_translations')
      ->map('entity', $this->builder->fromParent());
  }

}
