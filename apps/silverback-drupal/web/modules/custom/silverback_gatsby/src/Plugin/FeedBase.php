<?php

namespace Drupal\silverback_gatsby\Plugin;

use Drupal\Component\Plugin\PluginBase;
use Drupal\graphql\GraphQL\ResolverBuilder;

/**
 * Base class for Gatsby Data feeds.
 */
abstract class FeedBase extends PluginBase implements FeedInterface {

  /**
   * The GraphQL type this feed generates.
   *
   * @var string|mixed
   */
  protected string $typeName;

  /**
   * Indicates if this feed is translatable.
   *
   * @var bool
   */
  protected bool $translatable;

  /**
   * Indicates if this feed is diffable.
   *
   * @var bool
   */
  protected bool $diffable;

  /**
   * Instance of a ResolverBuilder.
   *
   * @var \Drupal\graphql\GraphQL\ResolverBuilder
   */
  protected ResolverBuilder $builder;

  /**
   * FeedBase constructor.
   *
   * @param $config
   * @param $plugin_id
   * @param $plugin_definition
   * @param $diffable
   * @param $translatable
   */
  public function __construct($config, $plugin_id, $plugin_definition, $diffable, $translatable) {
    parent::__construct($config, $plugin_id, $plugin_definition);
    $this->builder = new ResolverBuilder();
    $this->typeName = $config['typeName'];
    $this->diffable = $diffable;
    $this->translatable = $translatable;
  }

  protected function getTypeName() {
    return $this->typeName;
  }

  protected function getTranslationsTypeName() {
    return $this->translatable ? $this->getTypeName() . 'Translations' : null;
  }

  protected function getSingleFieldName() {
    return 'load' . $this->typeName;
  }

  protected function getListFieldName() {
    return 'query' . $this->typeName . 's';
  }

  protected function getChangesFieldName() {
    return 'diff' . $this->typeName . 's';
  }

  public function info(): array {
    return [
      'typeName' => $this->typeName,
      'translationsTypeName' => $this->getTranslationsTypeName(),
      'singleFieldName' => $this->getSingleFieldName(),
      'listFieldName' => $this->getListFieldName(),
      'changesFieldName' => $this->getChangesFieldName(),
    ];
  }

  /**
   * {@inheritDoc}
   */
  public function getSchemaDefinitions() : string{
    $typeName = $this->typeName;
    $singleFieldName = $this->getSingleFieldName();
    $listFieldName = $this->getListFieldName();
    $returnTypeName = $this->getTranslationsTypeName() ?: $typeName;
    $schema = [
      "extend type Query {",
      "  $singleFieldName(id: String!): $returnTypeName",
      "  $listFieldName(offset: Int!, limit: Int!): [$returnTypeName!]!",
    ];

    if ($changesFieldName = $this->getChangesFieldName()) {
      $schema[] = "  $changesFieldName(since: Int!, ids: [String!]!): [Change!]!";
    }

    $schema [] = "}";

    if ($translationsTypeName = $this->getTranslationsTypeName()) {
      $schema[] = "type $translationsTypeName implements Translatable {";
      $schema[] = "  id: String!";
      $schema[] = "  translations: [$typeName!]!";
      $schema[] = "}";
      $schema[] = "extend type $typeName implements Translation { langcode: String! }";
    }
    else {
      $schema[] = "extend type $typeName { id: String! }";
    }
    return implode("\n", $schema);
  }
}
