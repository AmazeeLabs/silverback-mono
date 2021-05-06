<?php

namespace Drupal\silverback_gatsby;

use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerProxy;

/**
 * Interface FeedInterface
 *
 * Describes a single data-feed that is sent to Gatsby.
 *
 * @package Drupal\silverback_gatsby
 */
interface FeedInterface {
  public function id() : string;
  public function info() : array;

  public function queryFieldDefinitions() : string;
  public function typeDefinitions() : string;

  public function resolveId() : DataProducerProxy;
  public function resolveTranslations() : DataProducerProxy;
  public function resolveItems() : DataProducerProxy;
  public function resolveItem() : DataProducerProxy;
  public function resolveChanges() : DataProducerProxy;
}
