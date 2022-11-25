<?php

namespace Drupal\Tests\graphql_directives\Kernel;

use Drupal\graphql\Entity\Server;
use Drupal\node\Entity\NodeType;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;
use Drupal\Tests\node\Traits\ContentTypeCreationTrait;
use Drupal\Tests\node\Traits\NodeCreationTrait;

class EntityTest extends GraphQLTestBase {
  use ContentTypeCreationTrait;
  use NodeCreationTrait;

  public static $modules = [
    'filter',
    'graphql_directives'
  ];

  protected function setUp(): void {
    parent::setUp();
    $this->installConfig('graphql_directives');
    $this->installConfig('filter');

    $path = \Drupal::moduleHandler()->getModule('graphql_directives')->getPath();
    $directives = $this->container->get('graphql_directives.printer')
      ->printDirectives();

    file_put_contents(
      $path . '/tests/assets/directives.graphqls',
      $directives
    );

    $this->server = Server::create([
      'status' => true,
      'name' => 'entity_test',
      'label' => 'Entity Test',
      'endpoint'=> '/graphql/entity-test',
      'schema' => 'directable',
      'schema_configuration'=> [
        'directable' => [
          'schema_definition' => __DIR__ . '/../assets/entity.graphqls',
          'extensions' => []
        ],
      ],
    ]);

    $postType = NodeType::create([
      'type' => 'post',
      'name' => 'Post',
    ]);
    $postType->save();
  }

  public function testStaticId() {
    $node = $this->createNode(['type' => 'post', 'title' => 'test']);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query { static { title } }', [], [
      'static' => [
        'title' => 'test'
      ]
    ], $metadata);
  }

  public function testIdFromParent() {
    $node = $this->createNode(['type' => 'post', 'title' => 'test']);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query { parent { title } }', [], [
      'parent' => [
        'title' => 'test'
      ]
    ], $metadata);
  }

  public function testIdFromArgument() {
    $node = $this->createNode(['type' => 'post', 'title' => 'test']);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query { argument(id: "1") { title } }', [], [
      'argument' => [
        'title' => 'test'
      ]
    ], $metadata);
  }

  public function testUuidFromArgument() {
    $node = $this->createNode(['type' => 'post', 'title' => 'test']);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query($uuid: String!) { uuid(id: $uuid) { title } }', [
      'uuid' => $node->uuid()
    ], [
      'uuid' => [
        'title' => 'test'
      ]
    ], $metadata);
  }

  public function testRoute() {
    $node = $this->createNode(['type' => 'post', 'title' => 'test']);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query($path: String!) { route(path: $path) { title } }', [
      'path' => '/node/1'
    ], [
      'route' => [
        'title' => 'test'
      ]
    ], $metadata);
  }

}
