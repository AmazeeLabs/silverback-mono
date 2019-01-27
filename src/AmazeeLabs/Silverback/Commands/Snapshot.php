<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Snapshot extends SilverbackCommand {

  protected function configure() {
    $this->setName('snapshot');
    $this->setDescription('Take a snapshot of the current state.');
    $this->addArgument('name', InputArgument::REQUIRED, 'The snapshot name.');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);
    $name = $input->getArgument('name');
    $hash = $this->getConfigHash();
    $dirname = "$name.$hash";

    if ($this->fileSystem->exists($this->cacheDir . '/' . $dirname)) {
      $this->fileSystem->remove($this->cacheDir . '/' . $dirname);
    }
    $this->copyDir('web/sites/default/files', $this->cacheDir . '/' . $dirname);
  }

}
