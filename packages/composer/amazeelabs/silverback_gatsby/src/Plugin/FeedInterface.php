<?php

namespace Drupal\silverback_gatsby\Plugin;

use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use GraphQL\Language\AST\DocumentNode;

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
   * Define extension schema definitions this Feed provides.
   *
   * @param \GraphQL\Language\AST\DocumentNode $parentAst
   *
   * @return string
   */
  public function getExtensionDefinition(DocumentNode $parentAst) : string;

  /**
   * Build resolvers for the defined schema definitions.
   *
   * @param \Drupal\graphql\GraphQL\ResolverRegistryInterface $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   */
  public function addExtensionResolvers(ResolverRegistryInterface $registry, ResolverBuilder $builder) : void;

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
   * @param \Drupal\Core\Session\AccountInterface $account
   *
   * @return \Drupal\silverback_gatsby\GatsbyUpdate[]
   */
  public function investigateUpdate($context, AccountInterface $account) : array;

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
