<?php

namespace Drupal\Tests\cypress\Unit;

use Drupal\cypress\NpmRootFactory;
use Drupal\Tests\UnitTestCase;

class NpmRootFactoryTest extends UnitTestCase {

  /**
   * @return void
   */
  function testNpmRootDirectory() {
    $this->assertEquals('/app', (new NpmRootFactory('/app', [
      '/app/features',
      '/app/modules/a/tests/Cypress',
    ]))->getDirectory());
  }
}
