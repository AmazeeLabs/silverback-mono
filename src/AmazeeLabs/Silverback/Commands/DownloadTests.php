<?php

namespace AmazeeLabs\Silverback\Commands;

use AmazeeLabs\Silverback\Helpers\EnvironmentQuestion;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;

class DownloadTests extends Command {

  protected function configure() {
    $this->setName('download-tests');
    $this->setDescription('Download test specifications to Jira.');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
  }

}
