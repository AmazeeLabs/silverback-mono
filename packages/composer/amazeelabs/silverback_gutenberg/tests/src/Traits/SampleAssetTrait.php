<?php

namespace Drupal\Tests\silverback_gutenberg\Traits;

trait SampleAssetTrait {

  protected function loadSample(string $name) {
    $path = __DIR__ . '/../assets/' . $name;
    $source = file_get_contents($path . '/source.html');
    $target = file_get_contents($path . '/target.html');
    $data = json_decode(file_get_contents($path . '/data.json'), TRUE);
    return [$source, $target, $data];
  }

}
