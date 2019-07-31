<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Restore extends SnapshotCommandBase {

  /**
   * {@inheritDoc}
   */
  protected function configure() {
    parent::configure();
    $this->setName('restore');
    $this->setDescription('Restore a named snapshot.');
  }

  /**
   * {@inheritDoc}
   */
  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);

    $siteDir = $this->getSnapshotSiteDirectory($input);
    $snapshotDirectory = $this->getSnapshotStorageDirectory($input);

    if (!$this->fileSystem->exists($snapshotDirectory)) {
      $output->writeln("Snapshot not found at $snapshotDirectory.");
      return 1;
    }
    $this->fileSystem->remove('web/sites/' . $siteDir . '/files');
    $this->copyDir($snapshotDirectory, 'web/sites/' . $siteDir . '/files');
    $output->writeln("Snapshot restored from $snapshotDirectory.");
  }

}
