<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class Teardown extends SilverbackCommand {

  protected function configure() {
    $this->setName('teardown');
    $this->setDescription('Remove an existing test site.');
    $this->addOption('restore', 'r', InputOption::VALUE_NONE, 'Restore the latest a backup of the current site.');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);
    $this->fileSystem->remove('web/sites/default/files');
    if ($input->getOption('restore') && $this->fileSystem->exists($this->cacheDir . '/backup')) {
      $this->copyDir($this->cacheDir . '/backup', 'web/sites/default/files');
    }
  }

}
