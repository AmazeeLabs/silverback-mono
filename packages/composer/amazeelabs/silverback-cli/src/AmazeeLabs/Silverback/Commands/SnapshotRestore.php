<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class SnapshotRestore extends SnapshotBase {

  /**
   * {@inheritDoc}
   */
  protected function configure() {
    parent::configure();
    $this->setName('snapshot-restore');
    $this->setAliases(['sr']);
    $this->setDescription('Restore a snapshot.');
  }

  /**
   * {@inheritDoc}
   */
  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);

    $snapshotDirectory = $this->getSnapshotStorageDirectory($input);

    if (!$this->fileSystem->exists($snapshotDirectory)) {
      $output->writeln("<error>Snapshot not found at $snapshotDirectory.</>");
      return 1;
    }

    $this->fileSystem->chmod('web/sites/default', 0755);
    $this->fileSystem->remove('web/sites/default/files');
    $this->copyDir($snapshotDirectory, 'web/sites/default/files');
    $output->writeln("<info>The snapshot has been restored from $snapshotDirectory.</>");
  }

}
