<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;

class ClearCache extends SilverbackCommand {

  protected function configure() {
    $this->setName('clear-cache');
    $this->setDescription('Remove all cached site installs.');
    $this->addOption('restore', 'r', InputOption::VALUE_OPTIONAL, 'Restore the latest a backup of the current site.');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);

    $finder = new Finder();
    if (!$this->fileSystem->exists($this->cacheDir)) {
      return;
    }

    $finder->in($this->cacheDir)->directories();
    foreach ($finder as $dir) {
      if ($dir->getRelativePath() !== 'backup') {
        $this->fileSystem->remove($this->cacheDir . '/'. $dir->getRelativePath());
      }
    }

  }

}
