<?php


namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\Tests\media\Traits\MediaTypeCreationTrait;
use Drupal\Tests\node\Traits\ContentTypeCreationTrait;
use Drupal\Tests\silverback_gutenberg\Traits\SampleAssetTrait;

class GutenbergTestBase extends KernelTestBase {

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

    $config = \Drupal::service('config.factory')->getEditable(
      'gutenberg.settings'
    );
    $config->set('page_enable_full', TRUE);
    $config->save();

    $this->installConfig(['language']);
    ConfigurableLanguage::createFromLangcode('de')->save();

    // Let LanguageServiceProvider register its path processors.
    drupal_flush_all_caches();
  }
}
