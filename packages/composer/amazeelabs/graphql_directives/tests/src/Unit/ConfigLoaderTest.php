<?php

use Drupal\Tests\UnitTestCase;
use Drupal\graphql_directives\ConfigLoader;

class ConfigLoaderTest extends UnitTestCase {
  public function testSingleFile(): void {
    $configFile = __DIR__ . '/../../assets/config/graphqlrc-single.yml';
    $this->assertEquals(implode("\n", [
      'type Query {',
      '  test: String @test',
      '}',
      '',
    ]), ConfigLoader::loadSchema($configFile));
  }

  public function testMultipleFiles(): void {
    $configFile = __DIR__ . '/../../assets/config/graphqlrc-multi.yml';
    $this->assertEquals(implode("\n", [
      'directive @test on FIELD_DEFINITION',
      '',
      'type Query {',
      '  test: String @test',
      '}',
      '',
    ]), ConfigLoader::loadSchema($configFile));
  }

}
