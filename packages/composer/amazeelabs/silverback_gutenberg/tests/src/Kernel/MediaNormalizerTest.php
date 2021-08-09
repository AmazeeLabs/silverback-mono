<?php

namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\media\Entity\Media;
use Drupal\node\Entity\Node;

class MediaNormalizerTest extends GutenbergTestBase {
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
