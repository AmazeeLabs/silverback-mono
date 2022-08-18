<?php

/**
 * Alter the path for the Silverback CDN CSR template.
 *
 * @param string $path
 * @param mixed $context
 *
 * @return void
 */
function hook_silverback_cdn_csr_template_path_alter(&$path, $context) {
  // Inspect the context and determine the path to the template.
  // $entity = \Drupal::entityTypeManager()->getStorage($context['entity_type'])->load($context['entity_id']);
  // $path = '/___csr/' . $entity->bundle();
}
