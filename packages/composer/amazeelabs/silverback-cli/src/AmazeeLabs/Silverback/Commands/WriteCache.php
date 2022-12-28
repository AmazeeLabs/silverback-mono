<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class WriteCache extends SilverbackCommand {

  protected function configure(): void {
    parent::configure();
    $this->setName('write-cache');
    $this->setDescription('Write current site state to the install cache.');
  }

  protected function execute(InputInterface $input, OutputInterface $output): int {
    parent::execute($input, $output);
    $public = 'web/sites/default/files';
    $zipCache = Setup::zipCache();
    $zipCacheExists = $this->fileSystem->exists($zipCache);
    if ($zipCacheExists) {
      $output->writeln("<info>Updating $zipCache...</>");
      $this->fileSystem->remove($zipCache);
    }
    else {
      $output->writeln("<info>Creating $zipCache...</>");
    }
    $zipFile = new \PhpZip\ZipFile();
    $zipFile->addDirRecursive($public, 'files')
      ->saveAsFile($zipCache);
    $output->writeln("<info>Cache has been written.</>");

    return 0;
  }

}
