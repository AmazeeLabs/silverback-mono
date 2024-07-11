<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link\Plugin\EntityReferenceSelection;

use Drupal\Core\Entity\Plugin\EntityReferenceSelection\DefaultSelection;

/**
 * Provides specific access control for the node entity type.
 *
 * This selection plugin can be changed by altering EntityReferenceSelection
 * manager definitions or by altering base field definitions.
 *
 * @EntityReferenceSelection(
 *   id = "silverback_preview_link",
 *   label = @Translation("Preview Link Default"),
 *   group = "silverback_preview_link",
 *   weight = 0,
 *   deriver = "Drupal\Core\Entity\Plugin\Derivative\DefaultSelectionDeriver"
 * )
 */
final class SilverbackPreviewLinkSelection extends DefaultSelection {

}
