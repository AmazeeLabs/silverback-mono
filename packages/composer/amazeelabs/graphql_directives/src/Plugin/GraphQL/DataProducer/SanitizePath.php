<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\DataProducer;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Sanitize an url path so its compatible with static site generation.
 *
 * TODO: This can cause 404 errors. The administration backend should not allow
 *       editors to create broken paths in the first place.
 *
 * @DataProducer(
 *   id = "sanitize_path",
 *   name = @Translation("Sanitize Path"),
 *   description = @Translation("Sanitize an url path so its compatible with SSG."),
 *   produces = @ContextDefinition("string",
 *     label = @Translation("Sanitized path")
 *   ),
 *   consumes = {
 *     "raw" = @ContextDefinition("string",
 *       label = @Translation("Raw path"),
 *       required = TRUE
 *     )
 *   }
 * )
 */
class SanitizePath extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  protected LoggerInterface $logger;

  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    LoggerInterface $logger
  ) {
    $this->logger = $logger;
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('logger.factory')->get('graphql_directives')
    );
  }

  public function resolve($raw) {
    // Gatsby expects raw paths. Not encoded.
    $path = rawurldecode($raw);

    // Some paths may ruin Gatsby.
    // See https://github.com/gatsbyjs/gatsby/discussions/36345#discussioncomment-3364844
    $original = $path;
    $bannedCharacters = ['%', '?', '#', '\\', '"'];
    foreach ($bannedCharacters as $character) {
      if (strpos($path, $character) !== FALSE) {
        $path = str_replace($character, '', $path);
        $this->logger->warning("Found entity with '{$character}' character in its path alias. The character will be removed from the Gatsby page path. This can lead to broken links. Please update the entity path alias. Original path alias: '{$original}'.");
      }
    }
    $dotsOnlyRegex = '/^\.+$/';
    $pathSegments = explode('/', $path);
    $pathSegmentsFiltered = array_filter(
      $pathSegments,
      fn(string $segment) => !preg_match($dotsOnlyRegex, $segment)
    );
    if (count($pathSegments) !== count($pathSegmentsFiltered)) {
      $path = implode('/', $pathSegmentsFiltered);
      $this->logger->warning("Found entity with dots-only path segment(s) in its path alias. These segments will be removed from the Gatsby page path. This can lead to broken links. Please update the entity path alias. Original path alias: '{$original}'.");
    }

    return $path;
  }

}
