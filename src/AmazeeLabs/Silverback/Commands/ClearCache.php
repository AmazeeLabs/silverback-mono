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
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);

    $finder = new Finder();
    if (!$this->fileSystem->exists($this->cacheDir)) {
      return;
    }

    $finder->in($this->cacheDir)->directories();
    $clear = [];
    foreach ($finder as $dir) {
      if ($dir->getRelativePathname() !== 'backup') {
        $clear[] = $dir->getRelativePathname();
      }
    }

    foreach ($clear as $dir) {
      $this->fileSystem->remove($this->cacheDir . '/' . $dir);
    }

  }

}
