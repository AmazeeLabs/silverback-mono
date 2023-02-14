<?php

namespace Drupal\silverback_gutenberg\GutenbergValidation;

use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Plugin\DefaultPluginManager;

/**
 * Provides a Gutenberg Validator Rule plugin manager.
 */
class GutenbergValidatorRuleManager extends DefaultPluginManager {

  /**
   * Constructs a GutenbergValidatorRuleManager object.
   *
   * @param \Traversable $namespaces
   *   An object that implements \Traversable which contains the root paths
   *   keyed by the corresponding namespace to look for plugin implementations.
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache_backend
   *   Cache backend instance to use.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler to invoke the alter hook with.
   */
  public function __construct(\Traversable $namespaces, CacheBackendInterface $cache_backend, ModuleHandlerInterface $module_handler) {
    parent::__construct(
      'Plugin/Validation/GutenbergValidatorRule',
      $namespaces,
      $module_handler,
      'Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorRuleInterface',
      'Drupal\silverback_gutenberg\Annotation\GutenbergValidatorRule'
    );
    $this->alterInfo('gutenberg_validator_rule_info');
    $this->setCacheBackend($cache_backend, 'gutenberg_validator_rule_info_plugins');
  }

}
