<?php

namespace Drupal\Tests\silverback_gutenberg\Unit;

use Drupal\gutenberg\Parser\BlockParser;
use Drupal\silverback_gutenberg\BlockSerializer;
use Drupal\Tests\silverback_gutenberg\Traits\SampleAssetTrait;
use Drupal\Tests\UnitTestCase;

class BlockSerializerTest extends UnitTestCase {

  use SampleAssetTrait;

  public function testSerialization() {
    [$source] = $this->loadSample('media');

    $serializer = (new BlockSerializer());
    $blocks = (new BlockParser())->parse($source);

    $expected = (simplexml_load_string('<div>' .$source . '</div>'));

    $actual = (simplexml_load_string('<div>' . $serializer->serialize_blocks($blocks) . '</div>'));

    $this->assertEquals($expected->saveXML(), $actual->saveXML());
  }

}
