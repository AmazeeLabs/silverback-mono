<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Teardown extends Command {

  protected function configure() {
    $this->setName('teardown');
    $this->setDescription('Remove an existing test site.');
    $this->addArgument('site', InputArgument::OPTIONAL, 'The site directory to tear down.', 'default');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
  }

}
