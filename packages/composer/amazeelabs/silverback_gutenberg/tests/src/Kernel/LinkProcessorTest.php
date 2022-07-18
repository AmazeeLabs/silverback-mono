<?php

namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\StreamWrapper\PublicStream;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\media\Entity\Media;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\silverback_gutenberg\LinkProcessor;
use Drupal\Tests\media\Kernel\MediaKernelTestBase;
use Drupal\user\Entity\User;

class LinkProcessorTest extends MediaKernelTestBase {

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

    $this->config('silverback_gutenberg.settings')
      ->set('local_hosts', [
        'this.site',
        'www.this.site',
      ])
      ->save();

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

    $media = Media::create([
      'bundle' => $this->testMediaType->id(),
      'name' => 'Unnamed',
      'field_media_test' => 'Whatever.',
    ]);
    $media->save();

    /** @var \Drupal\silverback_gutenberg\LinkProcessor $linkProcessor */
    $linkProcessor = \Drupal::service(LinkProcessor::class);

    $currentHost = \Drupal::request()->getHttpHost();
    $currentPort = \Drupal::request()->getPort();

    $cases = [
      'absolute' => [
        'inbound' => [
          'https://example.com/foo' => 'https://example.com/foo',
          'https://example.com/de/foo' => 'https://example.com/de/foo',
        ],
        'outbound' => [
          'https://example.com/foo' => [
            'en' => 'https://example.com/foo',
            'de' => 'https://example.com/foo',
          ],
          'https://example.com/de/foo' => [
            'en' => 'https://example.com/de/foo',
            'de' => 'https://example.com/de/foo',
          ],
        ],
      ],
      'without alias' => [
        'inbound' => [
          '/node/' . $withoutAlias->id() => '/node/' . $withoutAlias->uuid(),
          '/de/node/' . $withoutAlias->id() => '/node/' . $withoutAlias->uuid(),
        ],
        'outbound' => [
          '/node/' . $withoutAlias->id() => [
            'en' => '/node/' . $withoutAlias->id(),
            'de' => '/de/node/' . $withoutAlias->id(),
          ],
          '/node/' . $withoutAlias->uuid() => [
            'en' => '/node/' . $withoutAlias->id(),
            'de' => '/de/node/' . $withoutAlias->id(),
          ],
        ],
      ],
      'with alias' => [
        'inbound' => [
          '/node/' . $withAlias->id() => '/node/' . $withAlias->uuid(),
          '/de/node/' . $withAlias->id() => '/node/' . $withAlias->uuid(),
          '/english' => '/node/' . $withAlias->uuid(),
          '/de/german' => '/node/' . $withAlias->uuid(),
          "https://{$currentHost}:{$currentPort}/node/{$withAlias->id()}" => '/node/' . $withAlias->uuid(),
          'http://this.site/english' => '/node/' . $withAlias->uuid(),
          "https://www.this.site/de/german" => '/node/' . $withAlias->uuid(),
        ],
        'outbound' => [
          '/node/' . $withAlias->id() => [
            'en' => '/english',
            'de' => '/de/german',
          ],
          '/node/' . $withAlias->uuid() => [
            'en' => '/english',
            'de' => '/de/german',
          ],
          "https://{$currentHost}:{$currentPort}/node/{$withAlias->id()}" => [
            'en' => '/english',
            'de' => '/de/german',
          ],
          "http://this.site/de/node/{$withAlias->id()}" => [
            'en' => '/english',
            'de' => '/de/german',
          ],
          // In case if we somehow got an absolute URL in database, we just turn
          // it to relative.
          "https://www.this.site/de/german" => [
            'en' => '/de/german',
            'de' => '/de/german',
          ],
        ],
      ],
      'media' => [
        'inbound' => [
          '/media/' . $media->id() . '/edit' => '/media/' . $media->uuid() . '/edit',
          '/de/media/' . $media->id() . '/edit' => '/media/' . $media->uuid() . '/edit',
        ],
        'outbound' => [
          '/media/' . $media->id() . '/edit' => [
            'en' => '/media/' . $media->id() . '/edit',
            'de' => '/de/media/' . $media->id() . '/edit',
          ],
          '/media/' . $media->uuid() . '/edit' => [
            'en' => '/media/' . $media->id() . '/edit',
            'de' => '/de/media/' . $media->id() . '/edit',
          ],
        ],
      ],
      'unrouted' => [
        'inbound' => [
          '/unrouted-path' => '/unrouted-path',
          '/de/unrouted-path' => '/de/unrouted-path',
          '/unrouted-path with spaces' => '/unrouted-path with spaces',
        ],
        'outbound' => [
          '/unrouted-path' => [
            'en' => '/unrouted-path',
            'de' => '/unrouted-path',
          ],
          '/de/unrouted-path' => [
            'en' => '/de/unrouted-path',
            'de' => '/de/unrouted-path',
          ],
          '/unrouted-path with spaces' => [
            'en' => '/unrouted-path with spaces',
            'de' => '/unrouted-path with spaces',
          ],
        ],
      ],
      'mailto' => [
        'inbound' => [
          'mailto:someone@example.site' => 'mailto:someone@example.site',
        ],
        'outbound' => [
          'mailto:someone@example.site' => [
            'en' => 'mailto:someone@example.site',
            'de' => 'mailto:someone@example.site',
          ],
        ],
      ],
    ];

    foreach ($cases as $name => $directions) {
      foreach ($directions as $direction => $samples) {
        foreach ($samples as $original => $target) {
          if ($direction === 'inbound') {
            $url = $linkProcessor->processUrl($original, 'inbound');
            $this->assertEquals($target, $url, "Case name: {$name}, direction: {$direction}, original: {$original}");
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

  /**
   * @dataProvider urlFlagsProvider
   */
  public function testUrlFlags(string $url, bool $hasSchemeOrHost, bool $linksToCurrentHost, bool $isAsset) {
    /** @var \Drupal\silverback_gutenberg\LinkProcessor $linkProcessor */
    $linkProcessor = \Drupal::service(LinkProcessor::class);
    $url = str_replace('**BASE**', \Drupal::request()->getSchemeAndHttpHost(), $url);
    $url = str_replace('**HOST**', \Drupal::request()->getHttpHost(), $url);
    $url = str_replace('**FILES**', PublicStream::basePath(), $url);

    $this->assertEquals($hasSchemeOrHost, $linkProcessor->hasSchemeOrHost($url), "$url hasSchemeOrHost");
    $this->assertEquals($linksToCurrentHost, $linkProcessor->linksToCurrentHost($url), "$url linksToCurrentHost");
    $this->assertEquals($isAsset, $linkProcessor->isAsset($url), "$url isAsset");
  }

  public function urlFlagsProvider(): array {
    return [
      ['/foo', false, true, false],
      ['https://foo.bar/baz', true, false, false],
      ['http://this.site/foo', true, true, false],
      ['https://www.this.site/foo', true, true, false],
      ['//foo/bar', true, false, false],
      ['//**HOST**/bar', true, true, false],
      ['**BASE**', true, true, false],
      ['**BASE**/foo', true, true, false],
      ['**BASE**/**FILES**/foo.bar', true, true, true],
      ['/**FILES**/foo.bar', false, true, true],
      ['/system/files/foo.bar', false, true, true],
      ['**BASE**/system/files/foo.bar', true, true, true],
      ['**BASE**/fr/system/files/foo.bar', true, true, true],
      ['//**HOST**/system/files/foo.bar', true, true, true],
    ];
  }

}
