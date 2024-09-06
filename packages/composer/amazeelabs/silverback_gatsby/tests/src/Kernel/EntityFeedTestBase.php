<?php
namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\graphql\Entity\Server;
use Drupal\node\Entity\NodeType;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;

abstract class EntityFeedTestBase extends GraphQLTestBase {

  protected $strictConfigSchema = FALSE;

  protected static $modules = [
    'text',
    'path_alias',
    'graphql_directives',
    'silverback_gatsby',
    'silverback_gutenberg',
    'silverback_gatsby_example',
  ];

  /**
   * A GraphQL server instance triggering updates for a public build server.
   * @var \Drupal\graphql\Entity\Server|\Drupal\Core\Entity\EntityBase|\Drupal\Core\Entity\EntityInterface
   */
  protected $serverBuild;

  /**
   * A GraphQL server instance triggering updates for a preview server.
   * @var \Drupal\graphql\Entity\Server|\Drupal\Core\Entity\EntityBase|\Drupal\Core\Entity\EntityInterface
   */
  protected $serverPreview;

  /**
   * A GraphQL server instance triggering updates for a preview server.
   * @var \Drupal\graphql\Entity\Server|\Drupal\Core\Entity\EntityBase|\Drupal\Core\Entity\EntityInterface
   */
  protected $serverPublic;

  /**
   * Switch the test case to run queries against the build server.
   */
  protected function useBuildServer() {
    $this->server = $this->serverBuild;
  }

  /**
   * Switch the test case to run queries against the build server.
   */
  protected function usePreviewServer() {
    $this->server = $this->serverPreview;
  }

  /**
   * Switch the test case to run queries against the build server.
   */
  protected function usePublicServer() {
    $this->server = $this->serverPublic;
  }

  protected function setUp(): void {
    parent::setUp();
    $this->installSchema('silverback_gatsby', ['gatsby_update_log']);

    $userPreview = $this->createUser(['bypass node access']);
    $this->serverPreview = Server::create([
      'schema' => 'directable',
      'name' => 'silverback_gatsby_preview',
      'endpoint' => '/gatsby-preview',
      'schema_configuration' => [
        'directable' => [
          'extensions' => [
            'silverback_gatsby' => 'silverback_gatsby'
          ],
          'schema_definition' => __DIR__ . '/../../../modules/silverback_gatsby_example/graphql/silverback_gatsby_example.graphqls',
          'build_webhook' => 'http://localhost:8001/__refresh',
          'update_webhook' => 'http://localhost:8001/__update',
          'user' => $userPreview->uuid(),
        ]
      ]
    ]);
    $this->serverPreview->save();

    $userBuild = $this->createUser(['access content']);
    $this->serverBuild = Server::create([
      'schema' => 'directable',
      'name' => 'silverback_gatsby_build',
      'endpoint' => '/gatsby',
      'schema_configuration' => [
        'directable' => [
          'extensions' => [
            'silverback_gatsby' => 'silverback_gatsby'
          ],
          'schema_definition' => __DIR__ . '/../../../modules/silverback_gatsby_example/graphql/silverback_gatsby_example.graphqls',
          'build_webhook' => 'http://localhost:8000/__rebuild',
          'user' => $userBuild->uuid(),
        ]
      ]
    ]);
    $this->serverBuild->save();

    $userPublic = $this->createUser(['access content']);
    $this->serverPublic = Server::create([
      'schema' => 'directable',
      'name' => 'silverback_gatsby_public',
      'endpoint' => '/gatsby-public',
      'schema_configuration' => [
        'directable' => [
          'extensions' => [
            'silverback_gatsby' => 'silverback_gatsby'
          ],
          'schema_definition' => __DIR__ . '/../../../modules/silverback_gatsby_example/graphql/silverback_gatsby_example.graphqls',
          'user' => $userPublic->uuid(),
        ]
      ]
    ]);
    $this->serverPublic->save();

    // By default, we use the preview server, since unpublished nodes will only
    // trigger updates there.
    $this->usePreviewServer();

    $pageType = NodeType::create(
      [
        'type' => 'page',
        'name' => 'Page',
        'translatable' => TRUE,
      ]
    );
    $pageType->save();

    FieldStorageConfig::create([
      'field_name' => 'body',
      'entity_type' => 'node',
      'type' => 'text_long',
      'cardinality' => 1,
    ])->save();

    FieldConfig::create([
      'field_name' => 'body',
      'entity_type' => 'node',
      'bundle' => 'page',
      'label' => 'Body',
    ])->save();

    NodeType::create(
      [
        'type' => 'blog',
        'name' => 'Blog',
        'translatable' => FALSE,
      ]
    )->save();

    NodeType::create(
      [
        'type' => 'article',
        'name' => 'Article',
        'translatable' => FALSE,
      ]
    )->save();

    $this->container->get('content_translation.manager')->setEnabled(
      'node',
      'page',
      TRUE
    );

    $this->container->get('silverback_gatsby.update_handler')->schemaCache = NULL;
  }
}
