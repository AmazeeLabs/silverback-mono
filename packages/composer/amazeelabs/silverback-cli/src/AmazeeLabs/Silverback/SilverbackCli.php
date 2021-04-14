<?php

namespace AmazeeLabs\Silverback;

use AmazeeLabs\Silverback\Commands\SnapshotRestore;
use AmazeeLabs\Silverback\Commands\Setup;
use AmazeeLabs\Silverback\Commands\SnapshotCreate;
use AmazeeLabs\Silverback\Commands\Teardown;
use Symfony\Component\Console\Application;
use Symfony\Component\Filesystem\Filesystem;

class SilverbackCli extends Application {
  public function __construct($name = 'silverback', $version = '0.1') {
    parent::__construct($name, $version);
    $fileSystem = new Filesystem();
    $this->add(new Setup($fileSystem));
    $this->add(new Teardown($fileSystem));
    $this->add(new SnapshotCreate($fileSystem));
    $this->add(new SnapshotRestore($fileSystem));
  }
}
