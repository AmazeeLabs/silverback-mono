<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Snapshot extends SnapshotCommandBase {

  /**
   * {@inheritDoc}
   */
  protected function configure() {
    parent::configure();
    $this->setName('snapshot');
    $this->setDescription('Take a snapshot of the current state.');
  }

  /**
   * {@inheritDoc}
   */
  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);

    $path = $this->getSnapshotStorageDirectory($input);

    if ($this->fileSystem->exists($path)) {
      $output->writeln("Removing the existing snapshot.");
      $this->fileSystem->remove($path);
    }

    $this->copyDir('web/sites/' . $this->getSnapshotSiteDirectory($input) . '/files', $path);
    $output->writeln("The snapshot has been saved to $path.");
  }

}
