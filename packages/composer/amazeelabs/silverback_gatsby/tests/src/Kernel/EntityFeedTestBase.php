<?php
namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\node\Entity\NodeType;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;

abstract class EntityFeedTestBase extends GraphQLTestBase {

  protected $strictConfigSchema = FALSE;

  public static $modules = ['silverback_gatsby', 'silverback_gatsby_example'];

  protected function setUp(): void {
    parent::setUp();
    $this->installSchema('silverback_gatsby', ['gatsby_update_log']);

    $this->createTestServer(
      'silverback_gatsby_example',
      '/gatsby',
      [
        'schema_configuration' => [
          'silverback_gatsby_example' => [
            'extensions' => [
              'silverback_gatsby' => 'silverback_gatsby'
            ]
          ]
        ]
      ]
    );

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
