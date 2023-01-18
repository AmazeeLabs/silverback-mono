<?php

/**
 * Alter the results of the snapshot testing.
 */
function hook_graphql_snapshot_test_results_alter(array &$results): void {
  _my_module_mask_results($results, '');
}

function _my_module_mask_results(&$result, string $key): void {
  if ($key === 'myRandomField' && is_string($result)) {
    $result = '[random]';
  }
  if (is_array($result)) {
    if (
      isset($result['__typename']) &&
      $result['__typename'] === 'Image' &&
      isset($result['url']) &&
      is_string($result['url'])
    ) {
      $result['url'] = preg_replace('~/files/\d+-\d+/~', '/files/[date]/', $result['url']);
    }

    // Go through the tree.
    array_walk($result, '_my_module_mask_results');
  }
}
