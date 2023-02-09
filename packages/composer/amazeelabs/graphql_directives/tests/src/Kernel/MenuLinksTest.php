<?php

namespace Drupal\Tests\graphql_directives\Kernel;

use Drupal\menu_link_content\Entity\MenuLinkContent;
use Drupal\menu_link_content\MenuLinkContentInterface;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;
use Drupal\Tests\graphql_directives\Traits\GraphQLDirectivesTestTrait;

class MenuLinksTest extends GraphQLTestBase {
  use GraphQLDirectivesTestTrait;

  public static $modules = ['graphql_directives'];
  protected $itemCount;

  protected function setUp(): void {
    parent::setUp();
    $this->itemCount = 0;
    $this->setupDirectableSchema(__DIR__ . '/../../assets/menu_links');
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

  public function testEmptyMenu() {
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['languages:language_interface']);
    $metadata->addCacheTags(['config:system.menu.main']);
    $this->assertResults('{ menu { items { label } } }', [], [
      'menu' => [
        'items' => [],
      ],
    ], $metadata);
  }

  public function testMenuItems() {
    $foo = $this->createMenuItem('Foo', 'internal:/foo');
    $bar = $this->createMenuItem('Bar', 'internal:/bar');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['languages:language_interface']);
    $metadata->addCacheTags(['config:system.menu.main']);
    $this->assertResults('{ menu { items { label } } }', [], [
      'menu' => [
        'items' => [
          [
            'label' => 'Foo',
          ],
          [
            'label' => 'Bar',
          ],
        ]
      ],
    ], $metadata);
  }

  public function testMenuTree() {
    $foo = $this->createMenuItem('Foo', 'internal:/foo');
    $this->createMenuItem('Bar', 'internal:/bar', $foo);
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['languages:language_interface']);
    $metadata->addCacheTags(['config:system.menu.main']);
    $this->assertResults( '{ menu { items { parent label } } }', [], [
      'menu' => ['items' => [
        ['parent' => $foo->getPluginId(), 'label' => 'Bar'],
        ['parent' => '', 'label' => 'Foo'],
      ]],
    ], $metadata);
  }

  public function testMenuLevels() {
    $foo = $this->createMenuItem('Foo', 'internal:/foo');
    $bar = $this->createMenuItem('Bar', 'internal:/bar', $foo);
    $this->createMenuItem('Baz', 'internal:/baz', $bar);
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['languages:language_interface']);
    $metadata->addCacheTags(['config:system.menu.main']);
    $this->assertResults('{ menu { items { label } } }', [], [
      'menu' => ['items' => [
        [
          'label' => 'Baz',
        ],
        [
          'label' => 'Bar',
        ],
        [
          'label' => 'Foo',
        ],
      ]],
    ], $metadata);

    $this->assertResults('{ limited { items { label } } }', [], [
      'limited' => ['items' => [
        [
          'label' => 'Bar',
        ],
        [
          'label' => 'Foo',
        ],
      ]],
    ], $metadata);
  }

  public function testInaccessibleItems() {
    $this->createMenuItem('Foo', 'internal:/foo');
    // The admin link should not show up, since anonymous can't access it.
    $this->createMenuItem('Admin', 'internal:/admin');

    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['languages:language_interface']);
    $metadata->addCacheTags(['config:system.menu.main']);
    $this->assertResults('{ menu { items { label } } }', [], [
      'menu' => ['items' => [
        [
          'label' => 'Foo',
        ],
      ]],
    ], $metadata);
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

    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheContexts(['languages:language_interface']);
    $metadata->addCacheTags(['config:system.menu.main']);
    $this->assertResults('{ menu { items { label } } }', [], [
      'menu' => [
        'items' => [
          [
            'label' => $untranslated->label(),
          ],
          [
            'label' => $translated->label(),
          ],
        ],
      ],
    ], $metadata);

    $this->assertResults('{ menu:de { items { label } } }', [], [
      'menu' => [
        'items' => [
          [
            'label' => $translation->label(),
          ],
        ],
      ],
    ], $metadata);

    $this->assertResults('{ menu:fr { items { label } } }', [], [
      'menu' => [
        'items' => [],
      ],
    ], $metadata);
  }

}