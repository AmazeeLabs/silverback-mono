<?php

namespace Drupal\silverback_gatsby\Plugin;

use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\silverback_gatsby\GatsbyUpdate;

/**
 * Interface FeedInterface
 *
 * Describes a single data-feed that is sent to Gatsby.
 *
 * @package Drupal\silverback_gatsby
 */
interface FeedInterface {

  /**
   * Retrieve feed meta information used by the GraphQL schema.
   *
   * @return array
   */
  public function info() : array;

  /**
   * Decide if a type is translatable or not.
   *
   * @return bool
   */
  public function isTranslatable() : bool;

  /**
   * Investigate an arbitrary context value and produce a GatsbyUpdate if
   * applicable.
   *
   * @param $context
   *
   * @return \Drupal\silverback_gatsby\GatsbyUpdate | null
   */
  public function investigateUpdate($context);

  /**
   * Retrieve schema extension definitions provided by this feed.
   *
   * @return string
   */
  public function getSchemaDefinitions() : string;

  /**
   * Resolve the parent value's "id" attribute.
   *
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface
   */
  public function resolveId() : ResolverInterface;

  /**
   * Resolve the parent value's language association.
   *
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface
   */
  public function resolveLangcode() : ResolverInterface;

  /**
   * Resolve a list of all available translations.
   *
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface
   */
  public function resolveTranslations() : ResolverInterface;

  /**
   * Resolve a paginated list of all items of this type.
   *
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface
   */
  public function resolveItems() : ResolverInterface;

  /**
   * Load a single item by ID.
   *
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface
   */
  public function resolveItem() : ResolverInterface;


  public function getTypeName() : string;
  public function getTranslationsTypeName() : string;
  public function getSingleFieldName() : string;
  public function getListFieldName() : string;

}
