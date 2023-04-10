<?php

namespace Drupal\silverback_gutenberg\Plugin\Linkit\Matcher;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Entity\EntityTypeBundleInfoInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\linkit\Plugin\Linkit\Matcher\EntityMatcher;
use Drupal\linkit\SubstitutionManagerInterface;

/**
 * @Matcher(
 *   id = "silverback:entity:media",
 *   label = @Translation("Silverback: Media"),
 *   target_entity = "media",
 *   provider = "media"
 * )
 */
class SilverbackMediaMatcher extends EntityMatcher {

  use SilverbackMatcherTrait;

  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    Connection $database,
    EntityTypeManagerInterface $entity_type_manager,
    EntityTypeBundleInfoInterface $entity_type_bundle_info,
    EntityRepositoryInterface $entity_repository,
    ModuleHandlerInterface $module_handler,
    AccountInterface $current_user,
    SubstitutionManagerInterface $substitution_manager
  ) {
    parent::__construct(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $database,
      $entity_type_manager,
      $entity_type_bundle_info,
      $entity_repository,
      $module_handler,
      $current_user,
      $substitution_manager
    );
    $this->targetType = 'media';
  }

  public function buildConfigurationForm(
    array $form,
    FormStateInterface $form_state
  ) {
    $form = parent::buildConfigurationForm(
      $form,
      $form_state
    );

    // Silverback Gutenberg does not take this setting into account anyway.
    unset($form['substitution']);

    return $form;
  }


}
