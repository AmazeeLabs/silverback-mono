<?php

namespace Drupal\Tests\silverback_gutenberg\Unit;

use Drupal\silverback_gutenberg\MediaScanner;
use Drupal\Tests\silverback_gutenberg\Traits\SampleAssetTrait;
use Drupal\Tests\UnitTestCase;

class MediaScannerTest extends UnitTestCase {

  use SampleAssetTrait;

  protected MediaScanner $references;

  protected function setUp() : void {
    parent::setUp();
    $this->references = new MediaScanner();
  }

  public function testMediaReferences() {
    [$source, $target, $data] = $this->loadSample('media');
    $mediaIds = $this->references->extract($source);
    asort($mediaIds);
    $this->assertEquals(array_keys($data), array_values($mediaIds));
  }

}
