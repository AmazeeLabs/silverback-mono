<?php

/**
 * @file
 */

$currentDir = getcwd();
while (!file_exists($currentDir . '/vendor/autoload.php')) {
  $currentDir .= '/..';
}

require $currentDir . '/vendor/autoload.php';

(new AmazeeLabs\Silverback\SilverbackCli())->run();
