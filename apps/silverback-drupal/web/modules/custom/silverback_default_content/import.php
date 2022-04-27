<?php
if (PHP_SAPI !== 'cli') {
  die;
}

// We could use Import::run() here, but we use Import::runWithUpdate() to test
// it in silverback-mono.
\AmazeeLabs\DefaultContent\Import::runWithUpdate('silverback_default_content');
