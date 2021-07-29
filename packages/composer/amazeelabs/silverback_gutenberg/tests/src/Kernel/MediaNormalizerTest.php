<?php

namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\media\Entity\Media;
use Drupal\node\Entity\Node;
use Drupal\Tests\media\Traits\MediaTypeCreationTrait;
use Drupal\Tests\node\Traits\ContentTypeCreationTrait;
use Drupal\Tests\silverback_gutenberg\Traits\SampleAssetTrait;

class MediaNormalizerTest extends KernelTestBase {
  use ContentTypeCreationTrait;
  use MediaTypeCreationTrait;
  use SampleAssetTrait;
  protected $strictConfigSchema = FALSE;

  protected static $modules = [
    'file',
    'image',
    'media',
    'media_test_source',
    'field',
    'block_content',
    'path',
    'filter',
    'path_alias',
    'node',
    'user',
    'system',
    'language',
    'editor',
    'content_translation',
    'gutenberg',
    'views',
    'text',
    'silverback_gutenberg',
    'language',
    'content_translation',
    'default_content',
    'serialization',
    'hal',
  ];

  protected function setUp(): void {
    parent::setUp();
    $this->installSchema('system', 'sequences');
    $this->installSchema('node', 'node_access');
    $this->installSchema('file', 'file_usage');
    $this->installEntitySchema('node');
    $this->installEntitySchema('file');
    $this->installEntitySchema('user');
    $this->installEntitySchema('block_content');
    $this->installEntitySchema('path_alias');
    $this->installEntitySchema('media');
    $this->installConfig('block_content');
    $this->installConfig('filter');
    $this->installConfig('node');
    $this->installConfig('file');
    $this->installConfig('image');
    $this->installConfig('media');
    $this->installConfig(['gutenberg']);
    $this->createContentType([
      'type' => 'page',
      'name' => 'Basic page'
    ]);
    $this->createMediaType('test', ['id' => 'test']);

    $config = \Drupal::service('config.factory')->getEditable('gutenberg.settings');
    $config->set('page_enable_full', true);
    $config->save();

    $this->installConfig(['language']);
    ConfigurableLanguage::createFromLangcode('de')->save();

    // Let LanguageServiceProvider register its path processors.
    drupal_flush_all_caches();
  }

  public function testNormalization() {
    [$source, $target] = $this->loadSample('media');
    $image1 = Media::create(['bundle' => 'test']);
    $image1->save();

    $image2 = Media::create(['bundle' => 'test']);
    $image2->save();

    $target = str_replace(
      ['["abc"]', '["def"]'],
      ['["'. $image1->uuid().'"]', '["'.$image2->uuid().'"]'],
      $target
    );

    $node = Node::create([
      'type' => 'page',
      'title' => 'Test',
      'body' => $source,
    ]);
    $node->save();
    $node->addTranslation('de', [
      'body' => $source,
    ]);

    /** @var \Drupal\default_content\Normalizer\ContentEntityNormalizer $normalizer */
    $normalizer = $this->container->get('default_content.content_entity_normalizer');
    $this->assertTrue(_gutenberg_is_gutenberg_enabled($node));
    $result = $normalizer->normalize($node);
    $this->assertEquals($target, $result['default']['body'][0]['value']);
    $this->assertEquals($target, $result['translations']['de']['body'][0]['value']);
  }

  public function testDependencies() {
    [$source] = $this->loadSample('media');
    $image1 = Media::create(['bundle' => 'test']);
    $image1->save();

    $image2 = Media::create(['bundle' => 'test']);
    $image2->save();

    $node = Node::create([
      'type' => 'page',
      'title' => 'Test',
      'body' => $source,
    ]);
    $node->save();

    /** @var \Drupal\default_content\Normalizer\ContentEntityNormalizer $normalizer */
    $normalizer = $this->container->get('default_content.content_entity_normalizer');
    $this->assertTrue(_gutenberg_is_gutenberg_enabled($node));
    $result = $normalizer->normalize($node);

    $depends = [];
    $depends[$image1->uuid()] = 'media';
    $depends[$image2->uuid()] = 'media';
    $this->assertArrayHasKey('depends', $result['_meta']);
    $this->assertEquals($depends, $result['_meta']['depends']);
  }

  public function testDenormalization() {
    [$source] = $this->loadSample('media');
    $image1 = Media::create(['bundle' => 'test']);
    $image1->save();

    $image2 = Media::create(['bundle' => 'test']);
    $image2->save();

    $node = Node::create([
      'type' => 'page',
      'title' => 'Test',
      'body' => $source,
    ]);
    $node->save();
    $node->addTranslation('de', [
      'body' => $source,
    ]);

    /** @var \Drupal\default_content\Normalizer\ContentEntityNormalizer $normalizer */
    $normalizer = $this->container->get('default_content.content_entity_normalizer');
    $this->assertTrue(_gutenberg_is_gutenberg_enabled($node));
    $result = $normalizer->normalize($node);
    /** @var \Drupal\node\NodeInterface $denormalized */
    $denormalized = $normalizer->denormalize($result);
    $this->assertEquals($source, $denormalized->body->value);
    $this->assertEquals($source, $denormalized->getTranslation('de')->body->value);
  }
}
