<?php

namespace AmazeeLabs\Silverback\Commands;

use Alchemy\Zippy\Zippy;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class Setup extends SilverbackCommand {

  protected function configure(): void {
    parent::configure();
    $zipCache = self::zipCache();
    $this->setName('setup');
    $this->setDescription('Install a site.');
    $this->setHelp(<<<EOD
If --profile option is passed:
  - A new installation will be made using Drush site-install command (with --existing-config flag if case if Drupal configuration already exists in config/sync dir).
  - $zipCache will be created or updated.
Otherwise:
  - $zipCache will be used to restore the site.
  - The following Drush commands will be fired: updatedb, config-import, cache-rebuild.
EOD
    );
    $this->addOption('profile', 'p', InputOption::VALUE_OPTIONAL, 'A Drupal profile to use for a new installation.');
  }

  protected function execute(InputInterface $input, OutputInterface $output): int {
    parent::execute($input, $output);
    $profile = $input->getOption('profile');

    $public = 'web/sites/default/files';
    $private = 'web/sites/default/files/private';
    $zipCache = self::zipCache();
    $drush = './vendor/bin/drush';
    $zippy = Zippy::load();

    $this->cleanDir($public);

    $zipCacheExists = $this->fileSystem->exists($zipCache);

    if (!$zipCacheExists && !$profile) {
      $output->writeln("<error>No $zipCache found. Please pass --profile to make a new Drupal installation.</>");
      return 1;
    }

    $installFromCache = $zipCacheExists && !$profile;
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
        $profile,
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
    return 0;
  }

  public static function zipCache(): string {
    return 'install-cache.zip';
  }

}
