<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Restore extends SilverbackCommand {

  protected function configure() {
    $this->setName('restore');
    $this->setDescription('Restore a named snapshot.');
    $this->addArgument('name', InputArgument::REQUIRED, 'The snapshot name.');
    $this->addOption('cypress', 'c', InputOption::VALUE_NONE, 'Use cypress subdir.');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);
    $name = $input->getArgument('name');
    $hash = $this->getConfigHash();
    $dirname = "$name.$hash";
    $siteDir = $input->getOption('cypress') ? 'cypress' : 'default';

    if (!$this->fileSystem->exists($this->cacheDir . '/' . $dirname)) {
      $output->writeln("Unknown snapshot $name.");
      return 1;
    }
    $this->fileSystem->remove('web/sites/' . $siteDir . '/files');
    $this->copyDir($this->cacheDir . '/' . $dirname, 'web/sites/' . $siteDir . '/files');
  }

}
