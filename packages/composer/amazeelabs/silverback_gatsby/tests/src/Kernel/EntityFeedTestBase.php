<?php
namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\graphql\Entity\Server;
use Drupal\node\Entity\NodeType;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;

abstract class EntityFeedTestBase extends GraphQLTestBase {

  protected $strictConfigSchema = FALSE;

  public static $modules = ['silverback_gatsby', 'silverback_gatsby_example'];

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
   * A role ID that with the permission to view unpublished content.
   * @var false|string
   */
  protected $rolePreview;

  /**
   * A role ID that can only view published content.
   * @var false|string
   */
  protected $roleBuild;

  /**
   * A role ID that can only view published content.
   * @var false|string
   */
  protected $rolePublic;

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

    $this->rolePreview = $this->createRole(['bypass node access',], 'gatsby_preview');
    $this->serverPreview = Server::create([
      'schema' => 'silverback_gatsby_example',
      'name' => 'silverback_gatsby_preview',
      'endpoint' => '/gatsby-preview',
      'schema_configuration' => [
        'silverback_gatsby_example' => [
          'extensions' => [
            'silverback_gatsby' => 'silverback_gatsby'
          ],
          'build_webhook' => 'http://localhost:8001/__refresh',
          'role' => $this->rolePreview,
        ]
      ]
    ]);
    $this->serverPreview->save();

    $this->roleBuild = $this->createRole(['access content'], 'gatsby_build');
    $this->serverBuild = Server::create([
      'schema' => 'silverback_gatsby_example',
      'name' => 'silverback_gatsby_build',
      'endpoint' => '/gatsby',
      'schema_configuration' => [
        'silverback_gatsby_example' => [
          'extensions' => [
            'silverback_gatsby' => 'silverback_gatsby'
          ],
          'build_webhook' => 'http://localhost:8000/__rebuild',
          'role' => $this->roleBuild,
        ]
      ]
    ]);
    $this->serverBuild->save();

    $this->rolePublic = $this->createRole(['access content'], 'gatsby_public');
    $this->serverPublic = Server::create([
      'schema' => 'silverback_gatsby_example',
      'name' => 'silverback_gatsby_public',
      'endpoint' => '/gatsby-public',
      'schema_configuration' => [
        'silverback_gatsby_example' => [
          'extensions' => [
            'silverback_gatsby' => 'silverback_gatsby'
          ],
          'role' => $this->rolePublic,
        ]
      ]
    ]);
    $this->serverPublic->save();

    // By default, we use the preview server, since unpublished nodes will only
    // trigger updates there.
    $this->usePreviewServer();

    NodeType::create(
      [
        'type' => 'page',
        'name' => 'Page',
        'translatable' => TRUE,
      ]
    )->save();

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
  }
}
