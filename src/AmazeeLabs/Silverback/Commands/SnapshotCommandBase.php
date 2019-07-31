<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class SnapshotCommandBase extends SilverbackCommand {

  /**
   * {@inheritDoc}
   */
  protected function configure() {
    $this->addArgument('name', InputArgument::OPTIONAL, 'The snapshot name.', 'default');
    $this->addOption('cypress', 'c', InputOption::VALUE_NONE, 'Use cypress subdir.');
    $this->addOption('persist', 'p', InputOption::VALUE_OPTIONAL, 'Save the snapshot in persistent storage directory. Defaults to \'.silveback-snapshots\' be a different path can be given as the value.', false);
    $this->addOption('skip-config-hash', 's', InputOption::VALUE_NONE, 'Skip the config hashing.');
  }

  /**
   * Returns the name of the directory inside sites/ to take the snapshot of.
   *
   * @param \Symfony\Component\Console\Input\InputInterface $input
   *
   * @return string
   */
  protected function getSnapshotSiteDirectory(InputInterface $input) {
    return $siteDir = $input->getOption('cypress') ? 'cypress' : 'default';;
  }

  /**
   * Returns the destination path for the snapshot.
   *
   * @param \Symfony\Component\Console\Input\InputInterface $input
   *
   * @return string|null
   */
  protected function getSnapshotStorageDirectory(InputInterface $input) {
    $dirname = $input->getArgument('name');

    if (!$input->getOption('skip-config-hash')) {
      $dirname = "$dirname.{$this->getConfigHash()}";
    }

    $dirname = "$dirname-{$this->getSnapshotSiteDirectory($input)}";

    $baseDir = NULL;
    $persist = $input->getOption('persist');
    if ($persist !== false) {
      if (is_string($persist)) {
        $baseDir = $persist;
      } else {
        $baseDir = '.silverback-snapshots';
      }
    } else {
      $baseDir = $this->cacheDir;
    }

    return "$this->rootDirectory/$baseDir/$dirname";
  }

}
