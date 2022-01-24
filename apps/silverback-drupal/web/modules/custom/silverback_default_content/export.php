<?php
if (PHP_SAPI !== 'cli') {
  die;
}

// The list of excluded content entity types.
$excluded = [
  // Path aliases are created automatically on the node creation. They cause
  // troubles if exported to the default content.
  'path_alias',
];

\AmazeeLabs\DefaultContent\Export::run('silverback_default_content', $excluded);
