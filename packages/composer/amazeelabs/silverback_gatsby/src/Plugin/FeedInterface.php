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
   * @return \Drupal\silverback_gatsby\GatsbyUpdate[]
   */
  public function investigateUpdate($context) : array;

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
   * Determine if the item is the default translation.
   *
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface
   */
  public function resolveDefaultTranslation() : ResolverInterface;

  /**
   * Resolve a list of all available translations.
   *
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface
   */
  public function resolveTranslations() : ResolverInterface;

  /**
   * Resolve a paginated list of all items of this type.
   *
   * @param \Drupal\graphql\GraphQL\Resolver\ResolverInterface $limit
   * @param \Drupal\graphql\GraphQL\Resolver\ResolverInterface $offset
   *
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface
   */
  public function resolveItems(ResolverInterface $limit, ResolverInterface $offset) : ResolverInterface;

  /**
   * Load a single item by ID.
   *
   * @param \Drupal\graphql\GraphQL\Resolver\ResolverInterface $id
   * @param \Drupal\graphql\GraphQL\Resolver\ResolverInterface|null $langcode
   *
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface
   */
  public function resolveItem(ResolverInterface $id, ?ResolverInterface $langcode = null) : ResolverInterface;


  /**
   * Retrieve the GraphQL type name this feed emits.
   *
   * @return string
   */
  public function getTypeName() : string;

  /**
   * Retrieve the field name to load a single item.
   *
   * @return string
   */
  public function getSingleFieldName() : string;

  /**
   * Retrieve the field name to fetch multiple items via pagination.
   *
   * @return string
   */
  public function getListFieldName() : string;
}
