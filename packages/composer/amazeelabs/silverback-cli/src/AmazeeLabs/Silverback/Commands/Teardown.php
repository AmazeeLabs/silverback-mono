<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Teardown extends SilverbackCommand {

  protected function configure() {
    parent::configure();
    $this->setName('teardown');
    $this->setDescription('Delete the current site.');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);
    if ($this->fileSystem->exists('web/sites/default/files')) {
      $this->cleanDir('web/sites/default/files');
    }
    $output->writeln("<info>Deleted the current site.</>");
  }

}
