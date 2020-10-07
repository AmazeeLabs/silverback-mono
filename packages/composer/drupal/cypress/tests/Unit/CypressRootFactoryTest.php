<?php

namespace Drupal\Tests\cypress\Unit;

use Drupal\cypress\CypressRootFactory;
use Drupal\Tests\UnitTestCase;

class CypressRootFactoryTest extends UnitTestCase {
  function testCypressRootDirectory(): void {
    $this->assertEquals('/app/drupal-cypress-environment', (new CypressRootFactory('/app'))->getDirectory());
  }
}
