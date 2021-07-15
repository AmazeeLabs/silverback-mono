<?php

namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\KernelTests\KernelTestBase;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\silverback_gutenberg\LinkProcessor;
use Drupal\user\Entity\User;

class LinkProcessorTest extends KernelTestBase {

  protected static $modules = [
    'path',
    'path_alias',
    'node',
    'user',
    'system',
    'language',
    'content_translation',
    'silverback_gutenberg',
  ];

  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('node');
    $this->installEntitySchema('user');
    $this->installEntitySchema('path_alias');

    // https://www.drupal.org/project/drupal/issues/3056234
    User::create([
      'name' => '',
      'uid' => 0,
    ])->save();

    $this->installSchema('node', ['node_access']);

    $node_type = NodeType::create(['type' => 'page']);
    $node_type->save();

    $this->installConfig(['language']);
    ConfigurableLanguage::createFromLangcode('de')->save();

    // Let LanguageServiceProvider register its path processors.
    drupal_flush_all_caches();
  }

  public function register(ContainerBuilder $container) {
    parent::register($container);

    // Restore AliasPathProcessor tags which are removed in the parent method.
    $container->getDefinition('path_alias.path_processor')
      ->addTag('path_processor_inbound', ['priority' => 100])
      ->addTag('path_processor_outbound', ['priority' => 300]);
  }

  public function testProcessUrl() {
    $languages = \Drupal::languageManager()->getLanguages();

    $withoutAlias = Node::create([
      'title' => 'English without alias',
      'type' => 'page',
    ]);
    $withoutAlias->save();
    $translation = $withoutAlias->addTranslation('de', $withoutAlias->toArray());
    $translation->save();

    $withAlias = Node::create([
      'title' => 'English with alias',
      'type' => 'page',
      'path' => ['alias' => '/english'],
    ]);
    $withAlias->save();
    $translation = $withAlias->addTranslation('de', $withAlias->toArray());
    $translation->get('path')->alias = '/german';
    $translation->save();

    /** @var \Drupal\silverback_gutenberg\LinkProcessor $linkProcessor */
    $linkProcessor = \Drupal::service(LinkProcessor::class);

    $cases = [
      'absolute' => [
        'inbound' => [
          ['https://example.com/foo' => 'https://example.com/foo'],
          ['https://example.com/de/foo' => 'https://example.com/de/foo'],
        ],
        'outbound' => [
          [
            'https://example.com/foo' => [
              'en' => 'https://example.com/foo',
              'de' => 'https://example.com/foo',
            ],
          ],
          [
            'https://example.com/de/foo' => [
              'en' => 'https://example.com/de/foo',
              'de' => 'https://example.com/de/foo',
            ],
          ],
        ],
      ],
      'without alias' => [
        'inbound' => [
          ['/node/1' => '/node/1'],
          ['/de/node/1' => '/node/1'],
        ],
        'outbound' => [
          [
            '/node/1' => [
              'en' => '/node/1',
              'de' => '/de/node/1',
            ],
          ],
        ],
      ],
      'with alias' => [
        'inbound' => [
          ['/node/2' => '/node/2'],
          ['/de/node/2' => '/node/2'],
          ['/english' => '/node/2'],
          ['/de/german' => '/node/2'],
        ],
        'outbound' => [
          [
            '/node/2' => [
              'en' => '/english',
              'de' => '/de/german',
            ],
          ],
        ],
      ],
      'unrouted' => [
        'inbound' => [
          ['/unrouted-path' => '/unrouted-path'],
          ['/de/unrouted-path' => '/de/unrouted-path'],
        ],
        'outbound' => [
          [
            '/unrouted-path' => [
              'en' => '/unrouted-path',
              'de' => '/unrouted-path',
            ],
            '/de/unrouted-path' => [
              'en' => '/de/unrouted-path',
              'de' => '/de/unrouted-path',
            ],
          ],
        ],
      ],
    ];

    foreach ($cases as $name => $directions) {
      foreach ($directions as $direction => $samples) {
        foreach ($samples as $sample) {
          $target = reset($sample);
          $original = key($sample);
          if ($direction === 'inbound') {
            $processed = $target;
            $url = $linkProcessor->processUrl($original, 'inbound');
            $this->assertEquals($processed, $url, "Case name: {$name}, direction: {$direction}, original: {$original}");
          }
          else {
            foreach ($target as $langcode => $processed) {
              $url = $linkProcessor->processUrl($original, 'outbound', $languages[$langcode]);
              $this->assertEquals($processed, $url, "Case name: {$name}, direction: {$direction}, langcode: {$langcode}, original: {$original}");
            }
          }
        }
      }
    }

    return;

    $node->save();
    $this->assertFalse($node->get('path')->isEmpty());
    $this->assertEquals('/foo', $node->get('path')->alias);

    $stored_alias = $alias_repository->lookupBySystemPath('/' . $node->toUrl()
        ->getInternalPath(), $node->language()->getId());
    $this->assertEquals('/foo', $stored_alias['alias']);

    $nodeStorage->resetCache();

    /** @var \Drupal\node\NodeInterface $loaded_node */
    $loaded_node = $nodeStorage->load($node->id());
    $this->assertFalse($loaded_node->get('path')->isEmpty());
    $this->assertEquals('/foo', $loaded_node->get('path')->alias);
    $nodeStorage->resetCache();
    $loaded_node = $nodeStorage->load($node->id());
    $this->assertEquals('/foo', $loaded_node->get('path')[0]->get('alias')
      ->getValue());

    $nodeStorage->resetCache();
    $loaded_node = $nodeStorage->load($node->id());
    $values = $loaded_node->get('path')->getValue();
    $this->assertEquals('/foo', $values[0]['alias']);

    $nodeStorage->resetCache();
    $loaded_node = $nodeStorage->load($node->id());
    $this->assertEquals('/foo', $loaded_node->path->alias);

    // Add a translation, verify it is being saved as expected.
    $translation = $loaded_node->addTranslation('de', $loaded_node->toArray());
    $translation->get('path')->alias = '/furchtbar';
    $translation->save();

    // Assert the alias on the English node, the German translation, and the
    // stored aliases.
    $nodeStorage->resetCache();
    $loaded_node = $nodeStorage->load($node->id());
    $this->assertEquals('/foo', $loaded_node->path->alias);
    $translation = $loaded_node->getTranslation('de');
    $this->assertEquals('/furchtbar', $translation->path->alias);

    $stored_alias = $alias_repository->lookupBySystemPath('/' . $node->toUrl()
        ->getInternalPath(), $node->language()->getId());
    $this->assertEquals('/foo', $stored_alias['alias']);
    $stored_alias = $alias_repository->lookupBySystemPath('/' . $node->toUrl()
        ->getInternalPath(), $translation->language()->getId());
    $this->assertEquals('/furchtbar', $stored_alias['alias']);

    $loaded_node->get('path')->alias = '/bar';
    $this->assertFalse($loaded_node->get('path')->isEmpty());
    $this->assertEquals('/bar', $loaded_node->get('path')->alias);

    $loaded_node->save();
    $this->assertFalse($loaded_node->get('path')->isEmpty());
    $this->assertEquals('/bar', $loaded_node->get('path')->alias);

    $nodeStorage->resetCache();
    $loaded_node = $nodeStorage->load($node->id());
    $this->assertFalse($loaded_node->get('path')->isEmpty());
    $this->assertEquals('/bar', $loaded_node->get('path')->alias);

    $loaded_node->get('path')->alias = '/bar';
    $this->assertFalse($loaded_node->get('path')->isEmpty());
    $this->assertEquals('/bar', $loaded_node->get('path')->alias);

    $loaded_node->save();
    $this->assertFalse($loaded_node->get('path')->isEmpty());
    $this->assertEquals('/bar', $loaded_node->get('path')->alias);

    $stored_alias = $alias_repository->lookupBySystemPath('/' . $node->toUrl()
        ->getInternalPath(), $node->language()->getId());
    $this->assertEquals('/bar', $stored_alias['alias']);

    $old_alias = $alias_repository->lookupByAlias('/foo', $node->language()
      ->getId());
    $this->assertNull($old_alias);

    // Reload the node to make sure that it is possible to set a value
    // immediately after loading.
    $nodeStorage->resetCache();
    $loaded_node = $nodeStorage->load($node->id());
    $loaded_node->get('path')->alias = '/foobar';
    $loaded_node->save();

    $nodeStorage->resetCache();
    $loaded_node = $nodeStorage->load($node->id());
    $this->assertFalse($loaded_node->get('path')->isEmpty());
    $this->assertEquals('/foobar', $loaded_node->get('path')->alias);
    $stored_alias = $alias_repository->lookupBySystemPath('/' . $node->toUrl()
        ->getInternalPath(), $node->language()->getId());
    $this->assertEquals('/foobar', $stored_alias['alias']);

    $old_alias = $alias_repository->lookupByAlias('/bar', $node->language()
      ->getId());
    $this->assertNull($old_alias);

    $loaded_node->get('path')->alias = '';
    $this->assertEquals('', $loaded_node->get('path')->alias);

    $loaded_node->save();

    $stored_alias = $alias_repository->lookupBySystemPath('/' . $node->toUrl()
        ->getInternalPath(), $node->language()->getId());
    $this->assertNull($stored_alias);

    // Check that reading, updating and reading the computed alias again in the
    // same request works without clearing any caches in between.
    $loaded_node = $nodeStorage->load($node->id());
    $loaded_node->get('path')->alias = '/foo';
    $loaded_node->save();

    $this->assertFalse($loaded_node->get('path')->isEmpty());
    $this->assertEquals('/foo', $loaded_node->get('path')->alias);
    $stored_alias = $alias_repository->lookupBySystemPath('/' . $node->toUrl()
        ->getInternalPath(), $node->language()->getId());
    $this->assertEquals('/foo', $stored_alias['alias']);

    $loaded_node->get('path')->alias = '/foobar';
    $loaded_node->save();

    $this->assertFalse($loaded_node->get('path')->isEmpty());
    $this->assertEquals('/foobar', $loaded_node->get('path')->alias);
    $stored_alias = $alias_repository->lookupBySystemPath('/' . $node->toUrl()
        ->getInternalPath(), $node->language()->getId());
    $this->assertEquals('/foobar', $stored_alias['alias']);

    // Check that \Drupal\Core\Field\FieldItemList::equals() for the path field
    // type.
    $node = Node::create([
      'title' => $this->randomString(),
      'type' => 'foo',
      'path' => ['alias' => '/foo'],
    ]);
    $second_node = Node::create([
      'title' => $this->randomString(),
      'type' => 'foo',
      'path' => ['alias' => '/foo'],
    ]);
    $this->assertTrue($node->get('path')->equals($second_node->get('path')));

    // Change the alias for the second node to a different one and try again.
    $second_node->get('path')->alias = '/foobar';
    $this->assertFalse($node->get('path')->equals($second_node->get('path')));

    // Test the generateSampleValue() method.
    $node = Node::create([
      'title' => $this->randomString(),
      'type' => 'foo',
      'path' => ['alias' => '/foo'],
    ]);
    $node->save();
    $path_field = $node->get('path');
    $path_field->generateSampleItems();
    $node->save();
    $this->assertStringStartsWith('/', $node->get('path')->alias);
  }

}
