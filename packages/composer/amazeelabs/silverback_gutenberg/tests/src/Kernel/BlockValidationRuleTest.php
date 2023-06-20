<?php

namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\node\Entity\Node;
use Drupal\silverback_gutenberg\Plugin\Validation\Constraint\Gutenberg;
use Drupal\silverback_gutenberg\Plugin\Validation\Constraint\GutenbergValidator;
use Drupal\Tests\node\Traits\ContentTypeCreationTrait;
use Drupal\Tests\silverback_gutenberg\Traits\SampleAssetTrait;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class BlockValidationRuleTest extends KernelTestBase {

  use ContentTypeCreationTrait;
  use SampleAssetTrait;

  const FIELD_NAME = 'field_test';

  protected static $modules = [
    'system',
    'path_alias',
    'field',
    'node',
    'user',
    'text',
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

    $this->installSchema('system', 'sequences');
    $this->installEntitySchema('node');
    $this->installEntitySchema('user');
    $this->installConfig('node');
    $this->createContentType([
      'type' => 'page',
      'name' => 'Basic page'
    ]);

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

  /**
   * @dataProvider providerTestFieldValidator
   */
  public function testFieldValidator(string $body, array $expected_violations): void {
    $context = $this->prophesize(ExecutionContextInterface::class);
    $constraintValidator = new GutenbergValidator($this->validatorPluginManager, $this->validatorRulePluginManager);
    $constraintValidator->initialize($context->reveal());

    $node = Node::create([
      'type' => 'page',
      'title' => 'Test',
      'body' => $body,
    ]);
    $node->save();
    $constraintValidator->validate($node->get('body'), new Gutenberg());
    $violations = $this->getViolations($constraintValidator);
    $this->assertEquals($violations, $expected_violations);
  }

  /**
   * Data provider for ::testFieldValidator().
   */
  public function providerTestFieldValidator() {
    return [
      [
        'body' => '<!-- wp:custom/link {"linkLabel":"test","linkUrl":"https://example.com"} /-->',
        'violations' => [],
      ],
      [
        'body' => '<!-- wp:custom/link {"linkLabel":"test","linkUrl":""} /-->',
        'violations' => [
          [
            'attribute' => 'linkUrl',
            'blockName' => 'custom/link',
            'rule' => 'required',
            'message' => 'Link: <em class="placeholder">Link URL</em> field is required.',
          ],
        ]
      ],
      [
        'body' => '<!-- wp:custom/link {"linkLabel":"","linkUrl":"https://example.com"} /-->',
        'violations' => [
          [
            'attribute' => 'linkLabel',
            'blockName' => 'custom/link',
            'rule' => 'required',
            'message' => 'Link: <em class="placeholder">Link Label</em> field is required.',
          ],
        ]
      ],
      [
        'body' => '<!-- wp:custom/link {"linkLabel":"","linkUrl":""} /-->',
        'violations' => [
          [
            'attribute' => 'linkUrl',
            'blockName' => 'custom/link',
            'rule' => 'required',
            'message' => 'Link: <em class="placeholder">Link URL</em> field is required.',
          ],
          [
            'attribute' => 'linkLabel',
            'blockName' => 'custom/link',
            'rule' => 'required',
            'message' => 'Link: <em class="placeholder">Link Label</em> field is required.',
          ],
        ]
      ]
    ];
  }

  private function getViolations(GutenbergValidator $validator) {
    $reflection = new \ReflectionClass($validator);
    $property = $reflection->getProperty('violations');
    return $property->getValue($validator);
  }

}
