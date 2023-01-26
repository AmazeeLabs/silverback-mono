<?php

namespace Drupal\silverback_gutenberg\Plugin\Validation\Constraint;

use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorInterface;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorRuleManager;
use Drupal\Component\Plugin\Exception\PluginException;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Render\Markup;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\gutenberg\Parser\BlockParser;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorManager;

/**
 * Validator class for the Gutenberg required field.
 */
class GutenbergValidator extends ConstraintValidator implements ContainerInjectionInterface {

  use StringTranslationTrait;

  protected $violations = [];

  /**
   * Validator manager service plugin.
   *
   * @var \Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorManager
   */
  protected $validatorManager;

  /**
   * Validator rule manager service plugin.
   *
   * @var \Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorRuleManager
   */
  protected $validatorRuleManager;

  /**
   * Constructs a GutenbergValidator object
   * @param \Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorManager $validator_manager
   */
  public function __construct(
    GutenbergValidatorManager $validator_manager,
    GutenbergValidatorRuleManager $validator_rule_manager
  ) {
    $this->validatorManager = $validator_manager;
    $this->validatorRuleManager = $validator_rule_manager;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('plugin.manager.gutenberg_validator'),
      $container->get('plugin.manager.gutenberg_validator_rule')
    );
  }

  /**
   * {@inheritDoc}
   */
  public function validate($value, Constraint $constraint) {
    // If the field is empty, we don't need to validate it.
    // Delegate to Drupal.
    if (empty($value->getValue())) {
      return;
    }
    $content = $value->getValue()[0]['value'];
    $parser = new BlockParser();
    $blocks = $parser->parse($content);
    $plugins = [];
    foreach ($this->validatorManager->getDefinitions() as $definition) {
      try {
        $plugins[] = $this->validatorManager->createInstance($definition['id'], []);
      } catch (PluginNotFoundException | PluginException $e) {
        // Do nothing if the plugin could not be instantiated, although we
        // should never get here, as before we just had a call to
        // getDefinitions().
      }
    }

    if (!empty($plugins)) {
      $this->validateBlocks($blocks, $plugins);
    }
    // If we have any violations after running the blocks validation, we
    // aggregate all of them in one message and fire a validation for the
    // Gutenberg constraint.
    if (!empty($this->violations)) {
      $messages = [];
      foreach ($this->violations as $violation) {
        if (is_array($violation['message'])) {
          $messages = array_merge($messages, $violation['message']);
        } else {
          $messages[] = $violation['message'];
        }
      }
      $this->context->addViolation($this->t('Invalid content: <ul><li>@violations</li></ul>', ['@violations' => Markup::create(implode('</li><li>', $messages))]));
    }
  }

  /**
   * Validates a set of Gutenberg blocks (and their inner blocks) against a set
   * of validator plugins.
   *
   * @param $block
   * @param array $plugins
   */
  public function validateBlocks(array $blocks, array $plugins) {
    // @todo: we have here a pretty big nesting level, would be nice to find a
    //   solution to reduce it.
    array_walk($blocks, function($block) use ($plugins) {
      array_walk($plugins, function(GutenbergValidatorInterface $plugin) use ($block, $plugins) {
        // Check if the block has inner blocks, and validate them as well.
        if (!empty($block['innerBlocks'])) {
          $this->validateBlocks($block['innerBlocks'], [$plugin]);
        }
        if (!$plugin->applies($block)) {
          return;
        }
        $validatedFields = $plugin->validatedFields($block);
        if (!empty($validatedFields)) {
          array_walk($validatedFields, function($validatedField, $attrName) use ($block) {
            if (empty($validatedField['rules'])) {
              return;
            }
            $attrValue = $block['attrs'][$attrName] ?? NULL;
            array_walk($validatedField['rules'], function($validationRulePluginId) use ($attrValue, $attrName, $block, $validatedField) {
              try {
                $rulePlugin = $this->validatorRuleManager->createInstance($validationRulePluginId);
              } catch (PluginNotFoundException | PluginException $e) {
                return;
              }
              $validationMessage = $rulePlugin->validate($attrValue, $validatedField['field_label'] ?? $attrName);
              // If the returned value is the boolean TRUE, then it means the
              // field is valid, so we can just return.
              if ($validationMessage === TRUE) {
                return;
              }
              $this->violations[] = [
                'attribute' => $attrName,
                'blockName' => $block['blockName'],
                'rule' => $validationRulePluginId,
                'message' => $validationMessage,
              ];
            });
          });
        }
        // Last, call the validateContent method, in case there is a custom
        // validation logic in the validator plugin itself.
        $validateContent = $plugin->validateContent($block);
        if (!empty($validateContent) && $validateContent['is_valid'] !== TRUE) {
          $this->violations[] = [
            'attribute' => 'block_content',
            'blockName' => $block['blockName'],
            'rule' => 'block_content',
            'message' => $validateContent['message'],
          ];
        }
      });
    });
  }

}
