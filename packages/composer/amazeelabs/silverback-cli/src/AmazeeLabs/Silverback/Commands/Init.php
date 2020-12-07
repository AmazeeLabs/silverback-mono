<?php

namespace AmazeeLabs\Silverback\Commands;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;

class Init extends SilverbackCommand {

  protected function configure() {
    parent::configure();
    $this->setName('init');
    $this->setHelp('Creates/updates project configuration files in order to make the project usable with silverback-cli.');
    $this->setDescription('Initialise silverback project.');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);
    if (!$this->confirm($input, $output, 'This will adjust your project files. Continue?')) {
      return 1;
    }

    $projectName = basename($this->rootDirectory);

    $environment = [
      'SB_PROJECT_NAME' => [
        'value' => $projectName,
        'description' => 'Project name used for docker containers.',
      ],
      'SB_BASE_URL' => [
        'value' => 'http://localhost:8888',
        'description' => 'Web server base url.',
      ],
      'SB_ENVIRONMENT' => [
        'value' => 'development',
        'description' => 'The environment. Controls loading of the proper settings.php file.',
      ],
      'SB_DEVELOPMENT_MODE' => [
        'value' => '',
        'description' => 'Development mode. Settings tailored to specific tasks (e.g. theming).',
      ],
      'SB_ADMIN_USER' => [
        'value' => 'admin',
        'description' => 'Drupal admin username.',
      ],
      'SB_ADMIN_PASS' => [
        'value' => 'admin',
        'description' => 'Drupal admin password.',
      ],
      'DRUSH_OPTIONS_URI' => [
        'value' => '$SB_BASE_URL',
        'description' => 'Drush base url.',
      ],
      'DRUPAL_HASH_SALT' => [
        'value' => 'BANANA',
        'description' => 'Hash salt required by drupal and used in settings.php.',
      ],
      'PERCY_TOKEN' => [
        'value' => '',
        'description' => 'The API token for percy.io',
        'commentOut' => TRUE,
      ],
    ];

    $finder = new Finder();
    $finder->files()->in($this->rootDirectory . '/vendor/amazeelabs/silverback-cli/assets');
    $finder->ignoreDotFiles(FALSE);

    foreach ($finder as $file) {
      $this->fileSystem->copy(
        $file->getRealPath(),
        $this->rootDirectory . '/' . $file->getRelativePath() . '/' . $file->getFilename(),
        TRUE
      );
    }

    // Perform string replacement for project-specific values on some files.
    $replacements = [
      '${COMPOSE_PROJECT_NAME}' => $projectName,
      '${AMAZEEIO_PROJECT_URL}' => str_replace('_', '.', $projectName) . '.amazee.io',
    ];
    $projectSpecificFiles = [
      'docker-compose.yml',
      '.lagoon.yml',
    ];
    foreach ($projectSpecificFiles as $filename) {
      $filepath = "$this->rootDirectory/$filename";
      $contents = file_get_contents($filepath);
      $toReplace = array_keys($replacements);
      $values = array_values($replacements);
      file_put_contents($filepath, str_replace($toReplace, $values, $contents));
    }

    if (file_exists($this->rootDirectory . '/.lando.yml')) {
      unlink($this->rootDirectory . '/.lando.yml');
    }
    file_put_contents($this->rootDirectory . '/.lando.yml', "name: $projectName\nrecipe: drupal8\nconfig:\n  webroot: web\n");

    if (file_exists($this->rootDirectory . '/.env.example')) {
      unlink($this->rootDirectory . '/.env.example');
    }

    file_put_contents($this->rootDirectory . '/.env.example', implode("\n", array_map(function ($env) use ($environment) {
      $commentSign = empty($environment[$env]['commentOut']) ? '' : '# ';
      return "# {$environment[$env]['description']}\n{$commentSign}{$env}=\"{$environment[$env]['value']}\"\n";
    }, array_keys($environment))));

    $composerJson = json_decode(file_get_contents($this->rootDirectory . '/composer.json'), TRUE);
    $composerJson['scripts']['run-tests'] = [
      "./vendor/bin/silverback-test",
    ];
    $composerJson['extra']['enable-patching'] = TRUE;
    $composerJson['extra']['composer-exit-on-patch-failure'] = TRUE;

    // Search for composer.json overrides in the local packages directory.
    $composerJson['extra']['merge-plugin']['include'] = ['packages/composer.json'];
    $composerJson['extra']['merge-plugin']['replace'] = TRUE;

    file_put_contents($this->rootDirectory . '/composer.json', json_encode(array_filter($composerJson), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    $output->writeln("<info>Initialization is done. Please check the changes.</>");
  }

}
