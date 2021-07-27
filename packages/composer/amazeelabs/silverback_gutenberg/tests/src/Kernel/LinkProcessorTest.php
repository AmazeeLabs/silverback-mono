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

    // Workaround for https://www.drupal.org/project/drupal/issues/3056234
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
      'mailto' => [
        'inbound' => [
          ['mailto:someone@example.site' => 'mailto:someone@example.site'],
        ],
        'outbound' => [
          [
            'mailto:someone@example.site' => [
              'en' => 'mailto:someone@example.site',
              'de' => 'mailto:someone@example.site',
            ]
          ]
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
  }

}
