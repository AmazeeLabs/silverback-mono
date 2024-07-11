<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link;

use Drupal\Core\Entity\Sql\SqlEntityStorageInterface;
use Drupal\silverback_preview_link\Entity\SilverbackPreviewLinkInterface;

/**
 * Interface for Preview Link entities.
 *
 * @method \Drupal\silverback_preview_link\Entity\SilverbackPreviewLinkInterface[] loadMultiple(array $ids = NULL)
 * @method \Drupal\silverback_preview_link\Entity\SilverbackPreviewLinkInterface create(array $values = [])
 * @method int save(SilverbackPreviewLinkInterface $entity)
 */
interface PreviewLinkStorageInterface extends SqlEntityStorageInterface {

}
