<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class Setup extends SilverbackCommand {

  protected function configure() {
    $this->setName('setup');
    $this->setDescription('Install a new test site.');
    $this->addOption('backup', 'b', InputOption::VALUE_OPTIONAL, 'Create a backup of the current site.');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);

    if ($input->getOption('backup') && $this->fileSystem->exists('web/sites/default/files')) {
      $this->copyDir('web/sites/default/files', $this->cacheDir . '/backup');
    }

    $configDir = 'config/sync';
    if (!$this->fileSystem->exists('config/sync/core.extension.yml')) {
      $this->copyDir('vendor/amazeelabs/silverback/config', 'config/sync');
    }

    $finder = new Finder();
    $finder->files()->in($this->rootDirectory .'/'. $configDir);
    $files = [];
    foreach ($finder as $file) {
      $files[] = md5(file_get_contents($file->getRealPath()));
    }

    $this->fileSystem->remove('web/sites/default/files');

    $hash = md5(serialize($files));
    if (!$this->fileSystem->exists($this->cacheDir . '/' . $hash)) {
      $process = new Process([
        './vendor/bin/drush', 'si', '-y', 'minimal',
        '--sites-subdir', 'default',
        '--config-dir', '../' . $configDir,
        '--account-name', getenv('SB_ADMIN_USER'),
        '--account-pass', getenv('SB_ADMIN_PASS'),
      ], getcwd(), null, null, null);
      $process->run();
      if (!$process->isSuccessful()) {
        throw new ProcessFailedException($process);
      }
      file_put_contents('web/sites/default/.install.log', $process->getOutput());

      if ($testContent = getenv('SB_TEST_CONTENT')) {
        $process = new Process(['./vendor/bin/drush', 'en', '-y', $testContent]);
        $process->run();
        if (!$process->isSuccessful()) {
          throw new ProcessFailedException($process);
        }
      }

      $this->copyDir('web/sites/default/files', $this->cacheDir . '/' . $hash);
    }
    else {
      $this->copyDir($this->cacheDir . '/' . $hash, 'web/sites/default/files');
    }
  }

}
