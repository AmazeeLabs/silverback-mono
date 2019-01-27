<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Restore extends SilverbackCommand {

  protected function configure() {
    $this->setName('restore');
    $this->setDescription('Restore a named snapshot.');
    $this->addArgument('name', InputArgument::REQUIRED, 'The snapshot name.');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);
    $name = $input->getArgument('name');
    $hash = $this->getConfigHash();
    $dirname = "$name.$hash";

    if (!$this->fileSystem->exists($this->cacheDir . '/' . $dirname)) {
      $output->writeln("Unknown snapshot $name.");
      return 1;
    }
    $this->fileSystem->remove('web/sites/default/files');
    $this->copyDir($this->cacheDir . '/' . $dirname, 'web/sites/default/files');
  }

}
