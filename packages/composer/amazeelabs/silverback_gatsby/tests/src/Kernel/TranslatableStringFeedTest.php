<?php

namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\locale\StringStorageInterface;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;

/**
 * Test case for translatable strings in GraphQL.
 */
class TranslatableStringFeedTest extends GraphQLTestBase {

  /**
   * {@inheritdoc}
   */
  protected $strictConfigSchema = FALSE;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'locale',
    'graphql_directives',
    'silverback_gatsby',
    'silverback_gatsby_example',
  ];

  /**
   * The string storage.
   */
  protected StringStorageInterface $storage;

  /**
   * The GraphQL query for listing operations.
   */
  protected string $query = <<<'GQL'
    query {
      _queryTranslatableStrings {
        _id
        source
        _translations {
          _id
          language
          translation
        }
      }
    }
    GQL;

  /**
   * The GraphQL query for loading a single operation.
   */
  protected string $load = <<<'GQL'
    query load($id: String!) {
      _loadTranslatableString(id: $id) {
        _id
        source
        _translations {
          _id
          language
          translation
        }
      }
    }
    GQL;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->storage = $this->container->get('locale.storage');
    $this->installSchema('silverback_gatsby', ['gatsby_update_log']);
    $this->installSchema('locale', [
      'locales_source',
      'locales_target',
      'locales_location',
      'locale_file',
    ]);
    $schema = __DIR__ . '/../../schema/translatable-strings.graphql';
    $this->createTestServer(
      'directable',
      '/gatsby',
      [
        'schema_configuration' => [
          'directable' => [
            'extensions' => [
              'silverback_gatsby' => 'silverback_gatsby',
            ],
            'schema_definition' => $schema,
            'build_webhook' => 'http://127.0.0.1:8888/__refresh',
          ],
        ],
      ]
    );
  }

  /**
   * Verify that it just generates an empty result if there are no strings.
   */
  public function testQueryWithoutStrings(): void {
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheTags(['locale']);
    $this->assertResults($this->query, [], [
      '_queryTranslatableStrings' => [],
    ], $metadata);
  }

  /**
   * Test querying an untranslated string.
   */
  public function testQueryWithUntranslatedString(): void {
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheTags(['locale']);
    $this->storage->createString([
      'source' => 'test source',
      'context' => 'gatsby',
    ])->save();
    $this->assertResults($this->query, [], [
      '_queryTranslatableStrings' => [
        [
          '_id' => '1:en',
          'source' => 'test source',
          '_translations' => [],
        ],
      ],
    ], $metadata);
  }

  /**
   * List results with a translated string.
   */
  public function testQueryWithTranslatedString(): void {
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheTags(['locale']);
    $string = $this->storage->createString([
      'source' => 'test source',
      'context' => 'gatsby',
    ]);
    $string->save();
    $this->storage->createTranslation([
      'lid' => $string->lid,
      'language' => 'de',
      'translation' => 'test german',
    ])->save();

    $this->assertResults($this->query, [], [
      '_queryTranslatableStrings' => [
        [
          '_id' => '1:en',
          'source' => 'test source',
          '_translations' => [
            [
              '_id' => '1:de',
              'language' => 'de',
              'translation' => 'test german',
            ],
          ],
        ],
      ],
    ], $metadata);
  }

  /**
   * Test loading a translated string that does not exist.
   */
  public function testLoadNoneExistingString(): void {
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheTags(['locale']);
    $this->assertResults($this->load, ['id' => '1:en'], [
      '_loadTranslatableString' => NULL,
    ], $metadata);
  }

  /**
   * Test loading a translated string.
   */
  public function testLoadTranslatedString(): void {
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheTags(['locale']);
    $string = $this->storage->createString([
      'source' => 'test source',
      'context' => 'gatsby',
    ]);
    $string->save();
    $this->storage->createTranslation([
      'lid' => $string->lid,
      'language' => 'de',
      'translation' => 'test german',
    ])->save();

    $this->assertResults($this->load, ['id' => '1:de'], [
      '_loadTranslatableString' => [
        '_id' => '1:de',
        'source' => 'test source',
        '_translations' => [
          [
            '_id' => '1:de',
            'language' => 'de',
            'translation' => 'test german',
          ],
        ],
      ],
    ], $metadata);
  }

}
