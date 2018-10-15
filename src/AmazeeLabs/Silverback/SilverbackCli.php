<?php

namespace AmazeeLabs\Silverback;

use AmazeeLabs\Silverback\Commands\DownloadTests;
use AmazeeLabs\Silverback\Commands\Init;
use AmazeeLabs\Silverback\Commands\Setup;
use AmazeeLabs\Silverback\Commands\Teardown;
use Symfony\Component\Console\Application;
use Symfony\Component\Filesystem\Filesystem;

class SilverbackCli extends Application {

  public function __construct($name = 'silverback', $version = '0.1') {
    parent::__construct($name, $version);
    $fileSystem = new Filesystem();
    $this->add(new Setup());
    $this->add(new Teardown());
    $this->add(new Init($fileSystem));
    $this->add(new DownloadTests());
  }

}
