<?php

namespace SilverbackCli\Composer\Plugin\Scaffold;

use AmazeeLabs\Silverback\Commands\Init;
use Composer\Composer;
use Composer\IO\IOInterface;
use Drupal\Composer\Plugin\Scaffold\AllowedPackages;
use Drupal\Composer\Plugin\Scaffold\ManageOptions;
use Symfony\Component\Filesystem\Filesystem;

/**
 * Class ScaffoldHandler
 * @package SilverbackCli\Composer\Plugin\Scaffold
 */
class ScaffoldHandler {

  /**
   * Handler constructor.
   *
   * @param \Composer\Composer $composer
   *   The Composer service.
   * @param \Composer\IO\IOInterface $io
   *   The Composer I/O service.
   */
  public function __construct(Composer $composer, IOInterface $io) {
    $this->composer = $composer;
    $this->io = $io;
    $this->manageOptions = new ManageOptions($composer);
    $this->manageAllowedPackages = new AllowedPackages($composer, $io, $this->manageOptions);
  }

  /**
   * Copies all scaffold files from source to destination.
   */
  public function scaffold() {
    $fileSystem = new Filesystem();
    $initCommand = new Init($fileSystem);
    $initCommand->scaffold();
  }

}
