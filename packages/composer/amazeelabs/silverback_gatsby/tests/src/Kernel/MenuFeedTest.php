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

  public static $modules = ['silverback_gatsby', 'silverback_gatsby_example'];

  protected function setUp(): void {
    parent::setUp();
    $this->itemCount = 0;
    // Silverback Gatsby setup.
    $this->installSchema('silverback_gatsby', ['gatsby_update_log']);
    $this->createTestServer(
      'silverback_gatsby_example',
      '/gatsby',
      [
        'schema_configuration' => [
          'silverback_gatsby_example' => [
            'extensions' => [
              'silverback_gatsby' => 'silverback_gatsby'
            ],
            'build_webhook' => 'http://localhost:8888/__refresh'
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
  }

  protected function createMenuItem(string $label, string $url, MenuLinkContentInterface $parent = null, $menu = 'main') : MenuLinkContentInterface {
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

  protected function expectedResult(array $res = []) {
    return $res + [
      'queryMainMenus' => [
        [
          '__typename' => 'MainMenu',
          'id' => 'main',
          'drupalId' => 'main'
        ],
      ],
      'queryVisibleMainMenus' => [
        [
          '__typename' => 'VisibleMainMenu',
          'id' => 'main',
          'drupalId' => 'main'
        ],
      ],
      'loadMainMenu' => ['items' => []],
      'loadVisibleMainMenu' => ['items' => []],
    ];
  }

  public function testEmptyMenu() {
    $query = $this->getQueryFromFile('menus.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['languages:language_interface']);
    $metadata->addCacheTags(['config:system.menu.main', 'config:system.menu.access_denied']);
    $this->assertResults($query, [], $this->expectedResult(), $metadata);
  }

  public function testMenuItems() {
    $foo = $this->createMenuItem('Foo', 'internal:/foo');
    $bar = $this->createMenuItem('Bar', 'internal:/bar');
    $resultItems = [
      [
        'id' => $foo->getPluginId(),
        'parent' => '',
        'label' => 'Foo',
        'url' => '/foo'
      ],
      [
        'id' => $bar->getPluginId(),
        'parent' => '',
        'label' => 'Bar',
        'url' => '/bar'
      ],
    ];
    $query = $this->getQueryFromFile('menus.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['languages:language_interface']);
    $metadata->addCacheTags(['config:system.menu.main', 'config:system.menu.access_denied']);
    $this->assertResults($query, [], $this->expectedResult([
      'loadMainMenu' => ['items' => $resultItems],
      'loadVisibleMainMenu' => ['items' => $resultItems],
    ]), $metadata);
  }

  public function testMenuTree() {
    $foo = $this->createMenuItem('Foo', 'internal:/foo');
    $bar = $this->createMenuItem('Bar', 'internal:/bar', $foo);
    $resultItems = [
      [
        'id' => $bar->getPluginId(),
        'parent' => $foo->getPluginId(),
        'label' => 'Bar',
        'url' => '/bar'
      ],
      [
        'id' => $foo->getPluginId(),
        'parent' => '',
        'label' => 'Foo',
        'url' => '/foo'
      ],
    ];
    $query = $this->getQueryFromFile('menus.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['languages:language_interface']);
    $metadata->addCacheTags(['config:system.menu.main', 'config:system.menu.access_denied']);
    $this->assertResults($query, [], $this->expectedResult([
      'loadMainMenu' => ['items' => $resultItems],
      'loadVisibleMainMenu' => ['items' => $resultItems],
    ]), $metadata);
  }

  public function testMenuLevels() {
    $foo = $this->createMenuItem('Foo', 'internal:/foo');
    $bar = $this->createMenuItem('Bar', 'internal:/bar', $foo);
    $baz = $this->createMenuItem('Baz', 'internal:/baz', $bar);
    $query = $this->getQueryFromFile('menus.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['languages:language_interface']);
    $metadata->addCacheTags(['config:system.menu.main', 'config:system.menu.access_denied']);
    $this->assertResults($query, [], $this->expectedResult([
      'loadMainMenu' => ['items' => [
        [
          'id' => $baz->getPluginId(),
          'parent' => $bar->getPluginId(),
          'label' => 'Baz',
          'url' => '/baz'
        ],
        [
          'id' => $bar->getPluginId(),
          'parent' => $foo->getPluginId(),
          'label' => 'Bar',
          'url' => '/bar'
        ],
        [
          'id' => $foo->getPluginId(),
          'parent' => '',
          'label' => 'Foo',
          'url' => '/foo'
        ],
      ]],
      'loadVisibleMainMenu' => ['items' => [
        [
          'id' => $bar->getPluginId(),
          'parent' => $foo->getPluginId(),
          'label' => 'Bar',
          'url' => '/bar'
        ],
        [
          'id' => $foo->getPluginId(),
          'parent' => '',
          'label' => 'Foo',
          'url' => '/foo'
        ],
      ]],
    ]), $metadata);
  }

  public function testInaccessibleItems() {
    $foo = $this->createMenuItem('Foo', 'internal:/foo');
    // The admin link should not show up, since anonymous can't access it.
    $this->createMenuItem('Admin', 'internal:/admin');

    $query = $this->getQueryFromFile('menus.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['languages:language_interface']);
    $metadata->addCacheTags(['config:system.menu.main', 'config:system.menu.access_denied']);
    $this->assertResults($query, [], $this->expectedResult([
      'loadMainMenu' => ['items' => [
        [
          'id' => $foo->getPluginId(),
          'parent' => '',
          'label' => 'Foo',
          'url' => '/foo'
        ],
      ]],
      'loadVisibleMainMenu' => ['items' => [
        [
          'id' => $foo->getPluginId(),
          'parent' => '',
          'label' => 'Foo',
          'url' => '/foo'
        ],
      ]],
    ]), $metadata);
  }

  public function testMultilingualMenu() {
    $this->container
      ->get('content_translation.manager')
      ->setEnabled('menu_link_content', 'menu_link_content', TRUE);

    $untranslated = $this->createMenuItem('English', 'internal:/untranslated');
    $translated = $this->createMenuItem('English', 'internal:/translated');
    $translation = $translated->addTranslation('de', [
      'title' => 'German',
    ]);
    $translation->save();

    $query = $this->getQueryFromFile('multilingual-menus.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['languages:language_interface']);
    $metadata->addCacheTags(['config:system.menu.main']);
    $this->assertResults($query, [], [
      'loadMainMenu' => [
        'items' => [
          [
            'id' => $translation->getPluginId(),
            'parent' => '',
            'label' => $translation->label(),
            'url' => '/translated'
          ],
        ],
        'translations' => [
          [
            'langcode' => 'en',
            'items' => [
              [
                'id' => $untranslated->getPluginId(),
                'parent' => '',
                'label' => $untranslated->label(),
                'url' => '/untranslated'
              ],
              [
                'id' => $translated->getPluginId(),
                'parent' => '',
                'label' => $translated->label(),
                'url' => '/translated'
              ],
            ],
          ],
          [
            'langcode' => 'fr',
            'items' => [
              // French was not translations at all. The menu is empty there.
            ],
          ],
          [
            'langcode' => 'de',
              'items' => [
              [
                'id' => $translation->getPluginId(),
                'parent' => '',
                'label' => $translation->label(),
                'url' => '/translated'
              ],
            ],
          ],
        ],
      ],
    ], $metadata);
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
}
