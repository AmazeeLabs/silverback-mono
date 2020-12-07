<?php

namespace AmazeeLabs\Silverback\Commands;

use Alchemy\Zippy\Zippy;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class Setup extends SilverbackCommand {

  protected function configure() {
    parent::configure();
    $this->setName('setup');
    $this->setDescription('Install a new site.');
    $this->setHelp(<<<EOD
If install-cache.zip exist and --force flag is not provided:
  - The cache will be used to restore the site.
  - The following Drush commands will be fired: updatedb, config-import, cache-rebuild.
Otherwise:
  - A new installation will be made using Drush site-install command (with --existing-config flag if case if Drupal configuration already exists in config/sync dir).
  - install-cache.zip will be created or updated.
EOD
    );
    $this->addOption('force', 'f', InputOption::VALUE_NONE, 'Force installation, ignore install-cache.zip.');
    $this->addOption('profile', 'p', InputOption::VALUE_REQUIRED, 'A profile to use. The option is ignored if installing from cache.', 'minimal');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);

    $public = 'web/sites/default/files';
    $private = 'web/sites/default/files/private';
    $zipCache = 'install-cache.zip';
    $drush = './vendor/bin/drush';
    $zippy = Zippy::load();

    $this->cleanDir($public);

    $zipCacheExists = $this->fileSystem->exists($zipCache);
    $installFromCache = $zipCacheExists && !$input->getOption('force');
    $configExists = $this->fileSystem->exists('config/sync/core.extension.yml');

    if ($installFromCache) {
      $output->writeln("<info>Restoring from $zipCache...</>");
      $cache = $zippy->open($zipCache);
      $cache->extract('web/sites/default');
    }
    else {
      $output->writeln('<info>Installing from scratch' . ($configExists ? ' using existing config' : '') . '.</>');
      $this->executeProcess(array_filter([
        $drush,
        'si',
        '-y',
        $input->getOption('profile'),
        $configExists ? '--existing-config' : '',
        '--account-name',
        getenv('SB_ADMIN_USER'),
        '--account-pass',
        getenv('SB_ADMIN_PASS'),
      ]), $output);
    }

    if (!$this->fileSystem->exists($private)) {
      $this->fileSystem->mkdir($private);
    }

    if ($installFromCache) {
      $this->executeProcess([$drush, 'updb', '-y', '--cache-clear=0'], $output);
      if ($configExists) {
        $this->executeProcess([$drush, 'cim', '-y'], $output);
      }
      $this->executeProcess([$drush, 'cr'], $output);
    }
    else {
      if ($zipCacheExists) {
        $output->writeln("<info>Updating $zipCache...</>");
        $this->fileSystem->remove($zipCache);
      }
      else {
        $output->writeln("<info>Creating $zipCache...</>");
      }
      $zippy->create($zipCache, ['files' => $public], TRUE);
    }

    $output->writeln("<info>Setup complete.</>");
  }

}
