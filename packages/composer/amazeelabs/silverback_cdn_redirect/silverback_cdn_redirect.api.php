<?php

use Drupal\Core\Entity\EntityInterface;

/**
 * Alter the path for the Silverback CDN CSR template for a given entity.
 *
 * @param string $path
 * @param \Drupal\Core\Entity\EntityInterface $context
 *
 * @return void
 */
function hook_silverback_cdn_csr_template_path_alter(&$path, EntityInterface $entity) {
  $path = '/_/' . $entity->bundle();
}
