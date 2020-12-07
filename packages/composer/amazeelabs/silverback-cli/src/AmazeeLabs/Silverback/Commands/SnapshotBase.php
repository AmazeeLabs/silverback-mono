<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;

class SnapshotBase extends SilverbackCommand {

  /**
   * {@inheritDoc}
   */
  protected function configure() {
    parent::configure();
    $this->addArgument('name', InputArgument::OPTIONAL, 'The snapshot name.', 'default');
  }

  /**
   * Returns the destination path for the snapshot.
   *
   * @param \Symfony\Component\Console\Input\InputInterface $input
   *
   * @return string|null
   */
  protected function getSnapshotStorageDirectory(InputInterface $input) {
    $name = $input->getArgument('name');
    return "$this->rootDirectory/.silverback-snapshots/$name";
  }

}
