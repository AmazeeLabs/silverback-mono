<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Setup extends Command {

  protected function configure() {
    $this->setName('setup');
    $this->setDescription('Install a new test site.');
    $this->addArgument('site', InputArgument::OPTIONAL, 'The site directory to use.', 'default');
    $this->addArgument('config', InputArgument::OPTIONAL, 'The configuration directory to install from.', '../config/sync');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
  }

}
