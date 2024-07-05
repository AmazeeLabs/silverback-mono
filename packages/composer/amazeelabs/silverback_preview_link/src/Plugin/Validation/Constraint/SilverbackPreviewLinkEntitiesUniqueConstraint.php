<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;

/**
 * Ensures each entity is referenced at most once.
 *
 * @Constraint(
 *   id = "SilverbackPreviewLinkEntitiesUniqueConstraint",
 *   label = @Translation("Validates referenced value uniqueness", context = "Validation"),
 * )
 */
class SilverbackPreviewLinkEntitiesUniqueConstraint extends Constraint {

  /**
   * Violation message for when an entity is referenced multiple times.
   *
   * @var string
   */
  public $multipleReferences = '%entity_type is already referenced by item #%other_delta.';

}
