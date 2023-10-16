<?php

namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\menu_link_content\Entity\MenuLinkContent;
use Drupal\menu_link_content\MenuLinkContentInterface;
use Drupal\silverback_gatsby\GatsbyUpdate;
use Drupal\system\Entity\Menu;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;

class MenuFeedTest extends GraphQLTestBase {

  protected $strictConfigSchema = FALSE;
  protected $itemCount;

  public static $modules = [
    'path_alias',
    'graphql_directives',
    'silverback_gatsby',
    'silverback_gutenberg',
    'silverback_gatsby_example',
  ];

  protected function setUp(): void {
    parent::setUp();
    $this->itemCount = 0;
    // Silverback Gatsby setup.
    $this->installSchema('silverback_gatsby', ['gatsby_update_log']);
    $this->createTestServer(
      'directable',
      '/gatsby',
      [
        'schema_configuration' => [
          'directable' => [
            'extensions' => [
              'silverback_gatsby' => 'silverback_gatsby'
            ],
            'schema_definition' => __DIR__ . '/../../../modules/silverback_gatsby_example/graphql/silverback_gatsby_example.graphqls',
            'build_webhook' => 'http://127.0.0.1:8888/__refresh'
          ]
        ]
      ]
    );

    // Set up the menu system.
    $this->installEntitySchema('menu_link_content');
    // Create a menu nobody has access to (see `silverback_gatsby_example.module).
    Menu::create([
      'id' => 'access_denied',
      'label' => 'Access denied',
    ])->save();

    $this->container->get('silverback_gatsby.update_handler')->schemaCache = NULL;
  }

  protected function createMenuItem(string $label, string $url, MenuLinkContentInterface $parent = null, $menu = 'main'): MenuLinkContentInterface {
    $item = MenuLinkContent::create([
      'provider' => 'silverback_gatsby',
      'menu_name' => $menu,
      'title' => $label,
      'link' => ['uri' => $url],
      'weight' => $this->itemCount++,
    ] + ($parent ? ['parent' => $parent->getPluginId()] : []));
    $item->save();
    return $item;
  }

  public function testUpdateMenuItem() {
    $foo = $this->createMenuItem('Foo', 'internal:/foo');
    $bar = $this->createMenuItem('Bar', 'internal:/bar', $foo);
    $baz = $this->createMenuItem('Baz', 'internal:/baz', $bar);

    $tracker = $this->container->get('silverback_gatsby.update_tracker');

    // Change
    $latest = $tracker->latestBuild($this->server->id());
    $tracker->clear();
    $baz->title = 'BAZ';
    $baz->save();
    $current = $tracker->latestBuild($this->server->id());

    $diff = $tracker->diff($latest, $current, $this->server->id());
    $this->assertEquals([
      // This should update the 'MainMenu' type only, since the change happened
      // below the visible two levels of 'VisibleMainMenu'.
      new GatsbyUpdate('MainMenu', 'main'),
    ], $diff);

    $latest = $current;
    $tracker->clear();
    // Move $baz to level, which will trigger an update in both menus.
    $baz->parent = $foo->getPluginId();
    $baz->save();
    $current = $tracker->latestBuild($this->server->id());

    $diff = $tracker->diff($latest, $current, $this->server->id());
    $this->assertEquals([
      new GatsbyUpdate('MainMenu', 'main'),
      new GatsbyUpdate('VisibleMainMenu', 'main'),
    ], $diff);

    $latest = $current;
    $tracker->clear();
    // Move $baz back down, which should also trigger an update in both menus.
    $baz->parent = $bar->getPluginId();
    $baz->save();
    $current = $tracker->latestBuild($this->server->id());

    $diff = $tracker->diff($latest, $current, $this->server->id());
    $this->assertEquals([
      new GatsbyUpdate('MainMenu', 'main'),
      new GatsbyUpdate('VisibleMainMenu', 'main'),
    ], $diff);
  }

  public function testUpdateMultilingualMenu() {
    $this->container
      ->get('content_translation.manager')
      ->setEnabled('menu_link_content', 'menu_link_content', TRUE);
    $translated = $this->createMenuItem('English', 'internal:/translated');

    $tracker = $this->container->get('silverback_gatsby.update_tracker');
    $latest = $tracker->latestBuild($this->server->id());
    $tracker->clear();

    $translated->addTranslation('de', [
      'title' => 'German',
    ])->save();

    $current = $tracker->latestBuild($this->server->id());
    $tracker->clear();

    $diff = $tracker->diff($latest, $current, $this->server->id());
    $this->assertEquals([
      // This should update the 'MainMenu' type only, since the change happened
      // below the visible two levels of 'VisibleMainMenu'.
      new GatsbyUpdate('MainMenu', 'main:en'),
      new GatsbyUpdate('MainMenu', 'main:fr'),
      new GatsbyUpdate('MainMenu', 'main:de'),
      new GatsbyUpdate('VisibleMainMenu', 'main:en'),
      new GatsbyUpdate('VisibleMainMenu', 'main:fr'),
      new GatsbyUpdate('VisibleMainMenu', 'main:de'),
    ], $diff);
  }

  public function testDeletedMenuItem() {
    $foo = $this->createMenuItem('Foo', 'internal:/foo');

    $tracker = $this->container->get('silverback_gatsby.update_tracker');

    // Change
    $tracker->clear();
    $latest = $tracker->latestBuild($this->server->id());
    $foo->delete();
    $current = $tracker->latestBuild($this->server->id());

    $diff = $tracker->diff($latest, $current, $this->server->id());
    $this->assertEquals([
      new GatsbyUpdate('MainMenu', 'main'),
      new GatsbyUpdate('VisibleMainMenu', 'main'),
    ], $diff);
  }

  public function testTranslatableMenu() {
    $this->container
      ->get('content_translation.manager')
      ->setEnabled('menu_link_content', 'menu_link_content', TRUE);

    $query = $this->getQueryFromFile('multilingual-menus.gql');
    $this->assertResults($query, [], [
      'noLanguageDefined' => [
        '_id' => 'main:en',
      ],
      'en' => [
        '_id' => 'main:en',
      ],
      'de' => [
        '_id' => 'main:de',
      ],
    ], $this->defaultCacheMetaData()
        ->addCacheContexts(['languages:language_interface'])
        ->addCacheTags(['config:system.menu.main'])
    );
  }
}