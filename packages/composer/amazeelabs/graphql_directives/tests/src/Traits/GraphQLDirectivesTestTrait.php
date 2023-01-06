<?php

namespace Drupal\Tests\graphql_directives\Traits;

use Drupal\graphql\Entity\Server;

trait GraphQLDirectivesTestTrait {
  protected $container;
  private $assetsDirectory;


  public function getQueryFromFile($queryFile) {
    return file_get_contents($this->assetsDirectory . '/queries/' . $queryFile);
  }

  protected function setupDirectableSchema($directory, $extensions = []) {
    $this->assetsDirectory = $directory;
    $directives = $this->container->get('graphql_directives.printer')
      ->printDirectives();

    file_put_contents(
      $directory . '/directives.graphqls',
      $directives
    );

    $this->server = Server::create([
      'status' => true,
      'name' => 'directives_test',
      'label' => 'Directives Test',
      'endpoint'=> '/graphql/directives-test',
      'schema' => 'directable',
      'schema_configuration'=> [
        'directable' => [
          'schema_definition' => $directory . '/schema.graphqls',
          'extensions' => array_reduce(array_map(fn ($ext) => [$ext => $ext], $extensions), 'array_merge', []),
        ],
      ],
    ]);
  }

}