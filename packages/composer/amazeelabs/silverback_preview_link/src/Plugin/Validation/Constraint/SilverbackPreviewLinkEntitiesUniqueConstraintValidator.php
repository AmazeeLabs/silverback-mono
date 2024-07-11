<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link\Plugin\Validation\Constraint;

use Drupal\dynamic_entity_reference\Plugin\Field\FieldType\DynamicEntityReferenceFieldItemList;
use Drupal\dynamic_entity_reference\Plugin\Field\FieldType\DynamicEntityReferenceItem;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

/**
 * Validates the SilverbackPreviewLinkEntitiesUniqueConstraint constraint.
 */
class SilverbackPreviewLinkEntitiesUniqueConstraintValidator extends ConstraintValidator {

  /**
   * {@inheritdoc}
   */
  public function validate($value, Constraint $constraint): void {
    assert($constraint instanceof SilverbackPreviewLinkEntitiesUniqueConstraint);
    assert($value instanceof DynamicEntityReferenceFieldItemList);

    $entities = [];
    foreach ($value as $delta => $item) {
      assert($item instanceof DynamicEntityReferenceItem);
      $entity = $item->entity;
      $hash = $item->target_type . '|' . $item->target_id;
      $duplicateDelta = array_search($hash, $entities, TRUE);
      if ($duplicateDelta !== FALSE) {
        $this->context
          ->buildViolation($constraint->multipleReferences)
          ->setParameter('%entity_type', $entity !== NULL ? $entity->getEntityType()->getSingularLabel() : $item->target_type)
          ->setParameter('%other_delta', (string) ($duplicateDelta + 1))
          ->atPath((string) $delta)
          ->addViolation();
      }
      else {
        $entities[$delta] = $hash;
      }
    }
  }

}
