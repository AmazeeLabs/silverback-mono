<?php

namespace Drupal\silverback_gatsby\Plugin;

use Drupal\Component\Plugin\PluginBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\silverback_gatsby\GatsbyUpdate;
use GraphQL\Language\AST\DocumentNode;

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
   * The name of a GraphQL field containing the URL path of a node.
   *
   * @var string|null
   */
  protected ?string $pathFieldName;

  /**
   * The name of a GraphQL field containing the template name for a node.
   *
   * @var string|null
   */
  protected ?string $templateFieldName;

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
   */
  public function __construct($config, $plugin_id, $plugin_definition) {
    parent::__construct($config, $plugin_id, $plugin_definition);
    $this->builder = new ResolverBuilder();
    $this->typeName = $config['typeName'];
    $this->pathFieldName = $config['createPageFields']['isPath'] ?? NULL;
    $this->templateFieldName = $config['createPageFields']['isTemplate'] ?? NULL;
  }

  /**
   * {@inheritDoc}
   */
  public function getExtensionDefinition(DocumentNode $parentAst): string {
    return '';
  }

  /**
   * {@inheritDoc}
   */
  public function addExtensionResolvers(
    ResolverRegistryInterface $registry,
    ResolverBuilder $builder
  ): void {}


  public function getTypeName() : string {
    return $this->typeName;
  }

  public function getSingleFieldName() : string{
    return 'load' . $this->typeName;
  }

  public function getListFieldName() : string {
    return 'query' . $this->typeName . 's';
  }

  public function info(): array {
    return [
      'typeName' => $this->getTypeName(),
      'translatable' => $this->isTranslatable(),
      'singleFieldName' => $this->getSingleFieldName(),
      'listFieldName' => $this->getListFieldName(),
      'pathFieldName' => $this->pathFieldName,
      'templateFieldName' => $this->templateFieldName,
    ];
  }

  /**
   * Investigate the context of an update event and return its id if
   * applicable.
   *
   * @param mixed $context
   * @param \Drupal\Core\Session\AccountInterface $account
   *
   * @return string[]
   *   A list of string id's to update.
   */
  abstract function getUpdateIds($context, AccountInterface $account): array;

  /**
   * {@inheritDoc}
   */
  public function investigateUpdate($context, AccountInterface $account) : array {
    return array_map(
      fn ($id) => new GatsbyUpdate($this->getTypeName(), $id),
      $this->getUpdateIds($context, $account)
    );
  }

}
