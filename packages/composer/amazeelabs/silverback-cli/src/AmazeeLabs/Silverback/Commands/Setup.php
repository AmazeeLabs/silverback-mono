<?php

namespace AmazeeLabs\Silverback\Commands;

use Alchemy\Zippy\Zippy;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class Setup extends SilverbackCommand {

  protected function configure() {
    $this->setName('setup');
    $this->setDescription('Install a new test site.');
    $this->addOption('backup', 'b', InputOption::VALUE_NONE, 'Create a backup of the current site.');
    $this->addOption('force', 'f', InputOption::VALUE_NONE, 'Force installation.');
    $this->addOption('cypress', 'c', InputOption::VALUE_NONE, 'Use cypress subdir.');
    $this->addOption('profile', 'p', InputOption::VALUE_REQUIRED, 'Use profile config directory.', 'minimal');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);

    $siteDir = $input->getOption('cypress') ? 'cypress' : 'default';
    if ($input->getOption('cypress') && !$this->fileSystem->exists('web/sites/' . $siteDir))  {
      $this->copyDir('web/sites/default', 'web/sites/' . $siteDir);
      $this->cleanDir('web/sites/' . $siteDir . '/files');
    }

    $hash = $this->getConfigHash();

    if ($input->getOption('force')) {
      $this->fileSystem->remove($this->cacheDir . '/' . $hash);
    }

    if ($input->getOption('backup') && $this->fileSystem->exists('web/sites/' . $siteDir . '/files')) {
      $this->copyDir('web/sites/' . $siteDir . '/files', $this->cacheDir . '/backup');
    }

    $this->cleanDir('web/sites/' . $siteDir . '/files');

    // Remove the installation cache if a forced reinstall is requested.
    if ($this->fileSystem->exists('install-cache.zip') && $input->getOption('force')) {
      $this->fileSystem->remove('install-cache.zip');
    }

    $configExists = $this->fileSystem->exists('config/sync/core.extension.yml') && !$input->getOption('force');

    if (!$this->fileSystem->exists($this->cacheDir . '/' . $hash) || $input->getOption('force')) {
      $zippy = Zippy::load();
      if ($this->fileSystem->exists('install-cache.zip')) {
        $cache = $zippy->open('install-cache.zip');
        $cache->extract('web/sites/' . $siteDir);
        $baseCommand = ['./vendor/bin/drush'];
        if ($input->getOption('cypress')) {
          $baseCommand[] = '--uri=http://localhost:8889';
        }
        $this->executeProcess(array_merge($baseCommand, ['updb', '-y', '--cache-clear=0']), $output);
        if ($configExists) {
          $this->executeProcess(['./vendor/bin/drush', 'cim', '-y'], $output);
        }
        else {
          $this->executeProcess(['./vendor/bin/drush', 'cex', '-y'], $output);
        }
        $this->executeProcess(array_merge($baseCommand, ['cr']), $output);
      }
      else {
        $this->executeProcess(array_filter([
          './vendor/bin/drush', 'si', '-y', $input->getOption('profile'),
          '--sites-subdir', $siteDir,
          $configExists ? '--existing-config' : '',
          '--account-name', getenv('SB_ADMIN_USER'),
          '--account-pass', getenv('SB_ADMIN_PASS'),
        ]), $output);

        if ($configExists) {
          $this->executeProcess(['./vendor/bin/drush', 'cim', '-y'], $output);
        }
        else {
          $this->executeProcess(['./vendor/bin/drush', 'cex', '-y'], $output);
        }

        $zippy->create('install-cache.zip', [
          'files' => 'web/sites/' . $siteDir . '/files',
        ], TRUE);
      }

      $this->copyDir('web/sites/' . $siteDir . '/files', $this->cacheDir . '/' . $hash);
    }
    else {
      $this->copyDir($this->cacheDir . '/' . $hash, 'web/sites/' . $siteDir . '/files');
    }

    $private = 'web/sites/' . $siteDir . '/files/private';
    if (!$this->fileSystem->exists($private)) {
      $this->fileSystem->mkdir($private);
    }
  }

}
