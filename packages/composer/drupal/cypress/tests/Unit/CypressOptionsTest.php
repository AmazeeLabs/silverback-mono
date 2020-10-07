<?php

namespace Drupal\Tests\cypress\Unit;

use Drupal\cypress\CypressOptions;
use Drupal\Tests\UnitTestCase;

class CypressOptionsTest extends UnitTestCase {

  public function testDefaultOption(): void {
    $this->assertEquals(CypressOptions::DEFAULT['baseUrl'], (new CypressOptions())->getOptions()['baseUrl']);
  }

  public function testOptionOverride(): void {
    $this->assertEquals('http://localhost:8889', (new CypressOptions([
      'baseUrl' => 'http://localhost:8889',
    ]))->getOptions()['baseUrl']);
  }

  public function testFixedOption(): void {
    $this->assertEquals(CypressOptions::FIXED['integrationFolder'], (new CypressOptions([
      'integrationFolder' => 'foo',
    ]))->getOptions()['integrationFolder']);
  }

  public function testCypressJson(): void {
    $overrides = [
      'baseUrl' => 'http://localhost:8889',
      'trashAssetsBeforeRuns' => TRUE,
      // CLI or ENVIRONMENT options should not be added to cypress.json
      'spec' => 'foo',
      'tags' => '@bar',
    ];
    $cypressOptions = new CypressOptions($overrides);
    $string = json_encode(array_merge(
      CypressOptions::DEFAULT,
      [
        'baseUrl' => 'http://localhost:8889',
        'trashAssetsBeforeRuns' => TRUE,
        'env' => $cypressOptions->getEnvironment(),
      ],
      CypressOptions::FIXED
    ), JSON_PRETTY_PRINT);
    if (!$string) {
      throw new \Exception('Could not encode JSON.');
    }
    $this->assertJsonStringEqualsJsonString($string, $cypressOptions->getCypressJson());
  }

  public function testCliOptions(): void {
    $this->assertEquals(['--spec', 'foo'],  (new CypressOptions([
      'spec' => 'foo'
    ]))->getCliOptions());
  }

  public function testEnvironment(): void {
    $this->assertEquals([
      'TAGS' => '@bar',
      'CYPRESS_MODULE_PATH' => realpath(__DIR__ . '/../..'),
    ],  (new CypressOptions([
      'tags' => '@bar',
    ]))->getEnvironment());
  }
}
