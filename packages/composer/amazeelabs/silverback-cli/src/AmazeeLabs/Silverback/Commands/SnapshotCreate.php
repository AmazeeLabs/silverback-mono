<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class SnapshotCreate extends SnapshotBase {

  /**
   * {@inheritDoc}
   */
  protected function configure() {
    parent::configure();
    $this->setName('snapshot-create');
    $this->setAliases(['sc']);
    $this->setDescription('Take a snapshot of the current site.');
  }

  /**
   * {@inheritDoc}
   */
  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);

    $path = $this->getSnapshotStorageDirectory($input);

    if ($this->fileSystem->exists($path)) {
      if (!$this->confirm($input, $output, 'The snapshot already exists. Override it?')) {
        return 1;
      }
      $this->fileSystem->remove($path);
    }

    $this->copyDir('web/sites/default/files', $path);
    $output->writeln("</info>The snapshot has been saved to $path.</>");
  }

}
