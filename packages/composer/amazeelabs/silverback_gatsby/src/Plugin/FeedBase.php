<?php

namespace Drupal\silverback_gatsby\Plugin;

use Drupal\Component\Plugin\PluginBase;
use Drupal\Core\Entity\EntityInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\silverback_gatsby\GatsbyUpdate;

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
  }

  public function getTypeName() : string {
    return $this->typeName;
  }

  public function getTranslationsTypeName() : string {
    return $this->getTypeName() . 'Translations';
  }

  public function getSingleFieldName() : string{
    return 'load' . $this->typeName;
  }

  public function getListFieldName() : string {
    return 'query' . $this->typeName . 's';
  }

  public function info(): array {
    return [
      'typeName' => $this->isTranslatable()
        ? $this->getTranslationsTypeName()
        : $this->getTypeName(),
      'translationTypeName' => $this->isTranslatable()
        ? $this->getTypeName()
        : null,
      'singleFieldName' => $this->getSingleFieldName(),
      'listFieldName' => $this->getListFieldName(),
    ];
  }

  /**
   * Investigate the context of an update event and return it's id if
   * applicable.
   *
   * @param mixed $context
   *
   * @return mixed
   *   The id string of the feed item or null.
   */
  abstract function getUpdateId($context);

  /**
   * {@inheritDoc}
   */
  public function investigateUpdate($context) {
    if ($id = $this->getUpdateId($context)) {
      return new GatsbyUpdate($this->isTranslatable()
        ? $this->getTranslationsTypeName()
        : $this->getTypeName(), $id);
    }
  }

}
