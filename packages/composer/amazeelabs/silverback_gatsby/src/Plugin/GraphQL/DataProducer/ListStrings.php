<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\locale\SourceString;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @DataProducer(
 *   id = "list_strings",
 *   name = @Translation("List strings"),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Strings"),
 *     multiple = TRUE,
 *   ),
 *   consumes = {
 *     "offset" = @ContextDefinition("integer",
 *       label = @Translation("Offset"),
 *       required = FALSE,
 *     ),
 *     "limit" = @ContextDefinition("integer",
 *       label = @Translation("Limit"),
 *       required = FALSE,
 *     ),
 *   },
 * )
 */
class ListStrings extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The locale storage service.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    Connection $connection
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->$connection = $connection;
  }

  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('database'),
    );
  }

  public function resolve(?int $offset, ?int $limit, RefinableCacheableDependencyInterface $metadata) {
    // @todo: we should use the locale storage here, but we can't define an
    // offset.
    $query = $this->connection->select('locales_source', 's')
      ->fields('s')
      // @todo: this needs to be configurable.
      ->condition('s.context', 'gatsby')
      ->range($offset, $limit);
    $result = $query->execute();
    $strings = [];
    foreach ($result as $item) {
      $string = new SourceString($item);
      $strings[$string->getId()] = $string;
    }

    return $strings;
  }
}
