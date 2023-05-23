<?php

namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\silverback_gutenberg\Plugin\Validation\Constraint\Gutenberg;
use Drupal\silverback_gutenberg\Plugin\Validation\Constraint\GutenbergValidator;

class BlockValidationRuleTest extends KernelTestBase {

  const FIELD_NAME = 'field_test';

  protected static $modules = [
    'path_alias',
    'silverback_gutenberg',
    'silverback_gutenberg_test_validator',
  ];

  /**
   * @var \Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorRuleManager
   */
  protected $validatorRulePluginManager;

  /**
   * @var \Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorManager
   */
  protected $validatorPluginManager;

  protected function setUp(): void {
    parent::setUp();
    $this->validatorRulePluginManager = \Drupal::service('plugin.manager.gutenberg_validator_rule');
    $this->validatorPluginManager = \Drupal::service('plugin.manager.gutenberg_validator');
  }

  public function testEmailValidatorRule(): void {
    /** @var \Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorRuleInterface $emailValidator */
    $emailValidator = $this->validatorRulePluginManager->createInstance('email');
    $this->assertTrue($emailValidator->validate('test@example', self::FIELD_NAME));
    $this->assertTrue($emailValidator->validate('test@example.com', self::FIELD_NAME));
    $this->assertEquals($emailValidator->validate('test@', self::FIELD_NAME), '<em class="placeholder">' . self::FIELD_NAME . '</em> is not valid.');
  }

  public function testRequiredValidatorRule(): void {
    $requiredMessage = '<em class="placeholder">' . self::FIELD_NAME . '</em> field is required.';
    /** @var \Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorRuleInterface $requiredValidator */
    $requiredValidator = $this->validatorRulePluginManager->createInstance('required');
    $this->assertTrue($requiredValidator->validate('banana', self::FIELD_NAME));
    $this->assertEquals($requiredValidator->validate(NULL, self::FIELD_NAME), $requiredMessage);
    $this->assertEquals($requiredValidator->validate('', self::FIELD_NAME), $requiredMessage);
    $this->assertEquals($requiredValidator->validate('_none', self::FIELD_NAME), $requiredMessage);
  }

  /**
   * Limit test to content validator only.
   *
   * More specific cardinality tests are covered by BlocksValidatorCardinalityTest.
   *
   * @return void
   */
  public function testContentValidator(): void {
    // Validates any blocks.
    /** @var \Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorInterface $columnValidator */
    $columnValidator = $this->validatorPluginManager->createInstance('column_validator');
    $columnBlock = [
      'blockName' => 'core/column',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
        ],
      ],
    ];
    $this->assertEquals($columnValidator->validateContent($columnBlock), ['is_valid' => TRUE, 'message' => '']);

    // Validates multiple specific blocks.
    $groupValidator = $this->validatorPluginManager->createInstance('group_validator');
    $groupBlock = [
      'blockName' => 'core/group',
      'innerBlocks' => [
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/paragraph',
        ],
        [
          'blockName' => 'core/list',
        ],
      ],
    ];
    $this->assertEquals($groupValidator->validateContent($groupBlock), ['is_valid' => TRUE, 'message' => '']);
  }

}
