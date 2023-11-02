<?php

namespace Drupal\Tests\graphql_directives\Traits;

use Drupal\graphql\Entity\Server;

/**
 * Helper trait to set up directive based schemas.
 */
trait GraphQLDirectivesTestTrait {
  protected $container;
  private $assetsDirectory;

  /**
   * Retrieve a query string from a file.
   */
  public function getQueryFromFile($queryFile) {
    return file_get_contents($this->assetsDirectory . '/queries/' . $queryFile);
  }

  /**
   * Set up a schema from a directory that contains of graphql assets.
   *
   * @param array $extensions
   *   Schema extensions to be activated.
   */
  protected function setupDirectableSchema(string $directory, $extensions = []) : void {
    $this->assetsDirectory = $directory;
    $directives = $this->container->get('graphql_directives.printer')
      ->printDirectives();

    file_put_contents(
      $directory . '/directives.graphqls',
      $directives
    );

    $this->server = Server::create([
      'status' => TRUE,
      'name' => 'directives_test',
      'label' => 'Directives Test',
      'endpoint' => '/graphql/directives-test',
      'schema' => 'directable',
      'schema_configuration' => [
        'directable' => [
          'schema_definition' => $directory . '/schema.graphqls',
          'autoload_registry' => $directory . '/autoload.json',
          'extensions' => array_reduce(array_map(fn ($ext) => [$ext => $ext], $extensions), 'array_merge', []),
        ],
      ],
    ]);
  }

}

