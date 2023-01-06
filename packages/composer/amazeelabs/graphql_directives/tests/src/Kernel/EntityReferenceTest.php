<?php

namespace Drupal\Tests\graphql_directives\Kernel;

use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;
use Drupal\Tests\graphql_directives\Traits\GraphQLDirectivesTestTrait;

class EntityReferenceTest extends GraphQLTestBase {

  use GraphQLDirectivesTestTrait;

  public static $modules = [
    'graphql_directives',
    'node',
    'field',
    'entity_reference',
    'entity_reference_revisions',
  ];

  protected function setUp(): void {
    parent::setUp();
    $this->setupDirectableSchema(__DIR__ . '/../../assets/references');
    NodeType::create([
      'type' => 'article',
      'name' => 'Article',
      'translatable' => TRUE,
    ])->save();

    $this->container->get('content_translation.manager')->setEnabled(
      'node',
      'article',
      TRUE
    );

    FieldStorageConfig::create([
      'field_name' => 'references',
      'type' => 'entity_reference',
      'entity_type' => 'node',
      'cardinality' => FieldStorageDefinitionInterface::CARDINALITY_UNLIMITED,
      'settings' => [
        'target_type' => 'node',
      ],
    ])->save();

    FieldConfig::create([
      'field_name' => 'references',
      'entity_type' => 'node',
      'bundle' => 'article',
      'label' => 'References',
      'settings' => [
        'handler' => 'default',
        'handler_settings' => [],
      ],
    ])->save();

    FieldStorageConfig::create([
      'field_name' => 'revisions',
      'type' => 'entity_reference_revisions',
      'entity_type' => 'node',
      'cardinality' => FieldStorageDefinitionInterface::CARDINALITY_UNLIMITED,
      'settings' => [
        'target_type' => 'node',
      ],
    ])->save();

    FieldConfig::create([
      'field_name' => 'revisions',
      'entity_type' => 'node',
      'bundle' => 'article',
      'label' => 'Revisions',
      'settings' => [
        'handler' => 'default',
        'handler_settings' => [],
      ],
    ])->save();
  }

  public function testEntityReference() {
    $reference = Node::create([
      'title' => 'Reference',
      'type' => 'article',
      'langcode' => 'en',
    ]);
    $reference->save();

    $host = Node::create([
      'type' => 'article',
      'title' => 'Host',
      'langcode' => 'en',
      'references' => [$reference],
    ]);
    $host->save();

    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($host);
    $metadata->addCacheableDependency($reference);
    $metadata->addCacheContexts(['static:language:en']);
    $this->assertResults(
      'query ($nid: String!) { article(nid: $nid, lang: "en") { title references { title } } }',
      [
        'nid' => $host->id(),
        'lang' => 'en',
      ], [
      'article' => [
        'title' => 'Host',
        'references' => [
          [
            'title' => 'Reference',
          ],
        ],
      ],
    ], $metadata);
  }

  public function testTranslatedEntityReference() {
    $reference = Node::create([
      'title' => 'Reference',
      'type' => 'article',
    ]);
    $reference->save();
    $reference->addTranslation('de', [
      'title' => 'Reference (de)',
    ])->save();

    $host = Node::create([
      'type' => 'article',
      'title' => 'Host',
      'references' => [$reference],
    ]);
    $host->save();
    $host->addTranslation('de', [
      'title' => 'Host (de)',
      'references' => [$reference],
    ])->save();

    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($host);
    $metadata->addCacheableDependency($reference);
    $metadata->addCacheContexts(['static:language:de']);
    $this->assertResults(
      'query ($nid: String!) { article(nid: $nid, lang: "de") { title references { title } } }',
      [
        'nid' => $host->id(),
        'lang' => 'de',
      ], [
      'article' => [
        'title' => 'Host (de)',
        'references' => [
          [
            'title' => 'Reference (de)',
          ],
        ],
      ],
    ], $metadata);
  }

  public function testUntranslatedEntityReference() {
    $reference = Node::create([
      'title' => 'Reference',
      'type' => 'article',
    ]);
    $reference->save();

    $host = Node::create([
      'type' => 'article',
      'title' => 'Host',
      'references' => [$reference],
    ]);
    $host->save();
    $host->addTranslation('de', [
      'title' => 'Host (de)',
      'references' => [$reference],
    ])->save();

    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($host);
    $metadata->addCacheableDependency($reference);
    $metadata->addCacheContexts(['static:language:de']);
    $this->assertResults(
      'query ($nid: String!) { article(nid: $nid, lang: "de") { title references { title } } }',
      [
        'nid' => $host->id(),
        'lang' => 'de',
      ], [
      'article' => [
        'title' => 'Host (de)',
        'references' => [
          [
            'title' => 'Reference',
          ],
        ],
      ],
    ], $metadata);
  }

  public function testUntranslatedEntityReferee() {
    $reference = Node::create([
      'title' => 'Reference',
      'type' => 'article',
    ]);
    $reference->save();
    $reference->addTranslation('de', [
      'title' => 'Reference (de)',
    ])->save();

    $host = Node::create([
      'type' => 'article',
      'title' => 'Host',
      'references' => [$reference],
    ]);
    $host->save();

    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($host);
    $metadata->addCacheableDependency($reference);
    $metadata->addCacheContexts(['static:language:en']);
    $this->assertResults(
      'query ($nid: String!) { article(nid: $nid, lang: "en") { title references { title } } }',
      [
        'nid' => $host->id(),
        'lang' => 'de',
      ], [
      'article' => [
        'title' => 'Host',
        'references' => [
          [
            'title' => 'Reference',
          ],
        ],
      ],
    ], $metadata);
  }

  public function testRevisionedEntityReference() {
    $reference = Node::create([
      'title' => 'Reference',
      'type' => 'article',
    ]);
    $reference->save();

    $host = Node::create([
      'type' => 'article',
      'title' => 'Host',
      'references' => [$reference],
      'revisions' => [$reference],
    ]);
    $host->save();

    $reference->setNewRevision();
    $reference->set('title', 'Reference (rev)');
    $reference->save();


    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheableDependency($host);
    $metadata->addCacheableDependency($reference);
    $metadata->addCacheContexts(['static:language:en']);
    $this->assertResults(
      'query ($nid: String!) { article(nid: $nid, lang: "en") { title references { title } revisions { title } } }',
      [
        'nid' => $host->id(),
        'lang' => 'en',
      ], [
      'article' => [
        'title' => 'Host',
        'references' => [
          [
            'title' => 'Reference (rev)',
          ],
        ],
        'revisions' => [
          [
            'title' => 'Reference',
          ],
        ],
      ],
    ], $metadata);
  }

}