<?php

namespace Drupal\Tests\graphql_directives\Kernel;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\node\Entity\NodeType;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;
use Drupal\Tests\graphql_directives\Traits\GraphQLDirectivesTestTrait;
use Drupal\Tests\node\Traits\ContentTypeCreationTrait;
use Drupal\Tests\node\Traits\NodeCreationTrait;
use Drupal\Tests\Traits\Core\PathAliasTestTrait;

class EntitiesTest extends GraphQLTestBase {
  use NodeCreationTrait;
  use ContentTypeCreationTrait;
  use PathAliasTestTrait;
  use GraphQLDirectivesTestTrait;

  public static $modules = [
    'path_alias',
    'filter',
    'text',
    'graphql_directives'
  ];

  public function register(ContainerBuilder $container) {
    parent::register($container);

    // Restore AliasPathProcessor tags which are removed in the parent method.
    $container->getDefinition('path_alias.path_processor')
      ->addTag('path_processor_inbound', ['priority' => 100])
      ->addTag('path_processor_outbound', ['priority' => 300]);
  }

  protected function setUp(): void {
    parent::setUp();
    $this->installEntitySchema('path_alias');
    $this->installConfig('graphql_directives');
    $this->installConfig('filter');
    $this->setupDirectableSchema(__DIR__ . '/../../assets/entities');

    $postType = NodeType::create([
      'type' => 'post',
      'name' => 'Post',
      'translatable' => TRUE,
    ]);
    $postType->save();

    FieldStorageConfig::create([
      'field_name' => 'body',
      'entity_type' => 'node',
      'type' => 'text_long',
      'cardinality' => 1,
    ])->save();

    FieldConfig::create([
      'field_name' => 'body',
      'entity_type' => 'node',
      'bundle' => 'post',
      'label' => 'Body',
    ])->save();

    $this->container->get('content_translation.manager')->setEnabled(
      'node',
      'post',
      TRUE
    );
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

  public function testType() {
    $node = $this->createNode(['type' => 'post', 'title' => 'test']);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query { static { type } }', [], [
      'static' => [
        'type' => 'node'
      ]
    ], $metadata);
  }

  public function testBundle() {
    $node = $this->createNode(['type' => 'post', 'title' => 'test']);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query { static { bundle } }', [], [
      'static' => [
        'bundle' => 'post'
      ]
    ], $metadata);
  }

  public function testId() {
    $node = $this->createNode(['type' => 'post', 'title' => 'test']);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query { static { id } }', [], [
      'static' => [
        'id' => $node->id()
      ]
    ], $metadata);
  }

  public function testUuid() {
    $node = $this->createNode(['type' => 'post', 'title' => 'test']);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query { static { uuid } }', [], [
      'static' => [
        'uuid' => $node->uuid()
      ]
    ], $metadata);
  }

  public function testPath() {
    $node = $this->createNode(['type' => 'post', 'title' => 'test']);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query { static { path } }', [], [
      'static' => [
        'path' => '/node/1'
      ]
    ], $metadata);
  }

  public function testPathAlias() {
    $node = $this->createNode(['type' => 'post', 'title' => 'test']);
    $node->save();
    $this->createPathAlias('/node/1', '/test');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query { static { path } }', [], [
      'static' => [
        'path' => '/test'
      ]
    ], $metadata);
  }

  public function testPathSanitization() {
    $node = $this->createNode([
      'type' => 'post',
      'title' => 'test',
    ]);
    $node->save();
    $this->createPathAlias('/node/1', '/?test/./foo');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query { static { path } }', [], [
      'static' => [
        'path' => '/test/foo'
      ]
    ], $metadata);
  }

  public function testLanguage() {
    $node = $this->createNode([
      'type' => 'post',
      'title' => 'test',
      'langcode' => 'fr',
    ]);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query { static { language } }', [], [
      'static' => [
        'language' => 'fr'
      ]
    ], $metadata);
  }

  public function testTranslation() {
    $node = $this->createNode([
      'type' => 'post',
      'title' => 'test',
      'langcode' => 'en',
    ]);
    $node->save();
    $fr = $node->addTranslation('fr', ['title' => 'test fr']);
    $fr->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $metadata->addCacheContexts(['static:language:fr']);
    $this->assertResults('query { static { title translation { title } } }', [], [
      'static' => [
        'title' => 'test',
        'translation' => [
          'title' => 'test fr'
        ],
      ]
    ], $metadata);
  }

  public function testTranslations() {
    $node = $this->createNode([
      'type' => 'post',
      'title' => 'test',
      'langcode' => 'en',
    ]);
    $node->save();
    $fr = $node->addTranslation('fr', ['title' => 'test fr']);
    $fr->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $metadata->addCacheContexts(['static:language:fr', 'static:language:en']);
    $this->assertResults('query { static { translations { title } } }', [], [
      'static' => [
        'translations' => [
          ['title' => 'test'],
          ['title' => 'test fr'],
        ],
      ]
    ], $metadata);
  }

  public function testProperty() {
    $node = $this->createNode([
      'type' => 'post',
      'title' => 'test',
      'body' => 'body content',
    ]);
    $node->save();
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($node);
    $this->assertResults('query { static { body } }', [], [
      'static' => [
        'body' => 'body content'
      ]
    ], $metadata);
  }
}
