<?php

namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\KernelTests\KernelTestBase;

class BlockValidationRuleTest extends KernelTestBase {

  const FIELD_NAME = 'field_test';

  protected static $modules = [
    'path_alias',
    'silverback_gutenberg',
  ];

  /**
   * @var \Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorRuleManager
   */
  protected $validatorRulePluginManager;

  protected function setUp(): void {
    parent::setUp();
    $this->validatorRulePluginManager = \Drupal::service('plugin.manager.gutenberg_validator_rule');
  }

  public function testEmailValidator() {
    $emailValidator = $this->validatorRulePluginManager->createInstance('email');
    $this->assertTrue($emailValidator->validate('test@example', self::FIELD_NAME));
    $this->assertTrue($emailValidator->validate('test@example.com', self::FIELD_NAME));
    $this->assertEquals($emailValidator->validate('test@', self::FIELD_NAME), '<em class="placeholder">' . self::FIELD_NAME . '</em> is not valid.');
  }

  public function testRequiredValidator() {
    $requiredMessage = '<em class="placeholder">' . self::FIELD_NAME . '</em> field is required.';
    $requiredValidator = $this->validatorRulePluginManager->createInstance('required');
    $this->assertTrue($requiredValidator->validate('banana', self::FIELD_NAME));
    $this->assertEquals($requiredValidator->validate(NULL, self::FIELD_NAME), $requiredMessage);
    $this->assertEquals($requiredValidator->validate('', self::FIELD_NAME), $requiredMessage);
    $this->assertEquals($requiredValidator->validate('_none', self::FIELD_NAME), $requiredMessage);
  }

}
