<?php

namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\KernelTests\KernelTestBase;

class BlockValidationRuleTest extends KernelTestBase {

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
    $this->assertTrue($emailValidator->validate('test@example', 'field_test'));
    $this->assertTrue($emailValidator->validate('test@example.com', 'field_test'));
    $this->assertEquals($emailValidator->validate('test@', 'field_test'), '<em class="placeholder">field_test</em> is not valid.');
  }

  public function testRequiredValidator() {
    $requiredMessage = '<em class="placeholder">field_test</em> field is required.';
    $requiredValidator = $this->validatorRulePluginManager->createInstance('required');
    $this->assertTrue($requiredValidator->validate('banana', 'field_test'));
    $this->assertEquals($requiredValidator->validate(NULL, 'field_test'), $requiredMessage);
    $this->assertEquals($requiredValidator->validate('', 'field_test'), $requiredMessage);
    $this->assertEquals($requiredValidator->validate('_none', 'field_test'), $requiredMessage);
  }

}
