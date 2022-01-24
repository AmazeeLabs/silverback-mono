<?php
if (PHP_SAPI !== 'cli') {
  die;
}

\AmazeeLabs\DefaultContent\Import::run('silverback_default_content');
