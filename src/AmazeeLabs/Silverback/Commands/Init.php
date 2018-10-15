<?php

namespace AmazeeLabs\Silverback\Commands;

use AmazeeLabs\Silverback\Helpers\EnvironmentQuestion;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;

class Init extends Command {

  /**
   * @var \Symfony\Component\Filesystem\Filesystem
   */
  protected $fileSystem;

  public function __construct(Filesystem $fileSystem) {
    parent::__construct();
    $this->fileSystem = $fileSystem;
  }

  protected function configure() {
    $this->setName('init');
    $this->setDescription('Initialise silverback project.');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
    /** @var \Symfony\Component\Console\Helper\QuestionHelper $questionHelper */
    $questionHelper = $this->getHelper('question');

    $rootDir = realpath(__DIR__ . '/../../../../../../../');

    $projectName = $questionHelper->ask($input, $output, new EnvironmentQuestion(
      'Specify the project name',
      basename($rootDir)
    ));

    $jiraHost = $questionHelper->ask($input, $output, new EnvironmentQuestion(
      'Specify the Jira host to use',
      'jira.amazeelabs.com'
    ));

    $jiraUser = $questionHelper->ask($input, $output, new EnvironmentQuestion(
      'Jira username',
      ''
    ));

    $jiraPass = $questionHelper->ask($input, $output, new EnvironmentQuestion(
      'Jira password [web]:',
      ''
    ));

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
      'SB_JIRA_HOST' => [
        'value' => $jiraHost,
        'description' => 'Jira host to download testfiles from.',
      ],
      'SB_JIRA_USER' => [
        'value' => $jiraUser,
        'description' => 'Jira username.',
      ],
      'SB_JIRA_PASS' => [
        'value' => $jiraPass,
        'description' => 'Jira password.',
      ],
      'DRUSH_OPTIONS_URI' => [
        'value' => '$SB_BASE_URL',
        'description' => 'Drush base url.'
      ],
      'CYPRESS_BASE_URL' => [
        'value' => '$SB_BASE_URL',
        'description' => 'Cypress base url.'
      ],
      'CYPRESS_TAGS' => [
        'value' => '@assignee:$JIRA_USER and @WIP',
        'description' => '`cypress run` will only execute tests tagged like this:'
      ],
    ];

    $finder = new Finder();
    $finder->files()->in(__DIR__ . '/../../../../assets');
    $finder->ignoreDotFiles(FALSE);

    foreach ($finder as $file) {
      $this->fileSystem->copy(
        $file->getRealPath(),
        $rootDir . '/' . $file->getRelativePath() . '/' . $file->getFilename(),
        TRUE
      );
    }

    if (file_exists($rootDir . '/.lando.yml')) {
      unlink($rootDir . '/.lando.yml');
    }
    file_put_contents($rootDir . '/.lando.yml', "name: $projectName\nrecipe: drupal8\nconfig:\n  webroot: web\n");

    if (file_exists($rootDir . '/.env.example')) {
      unlink($rootDir . '/.env.example');
    }

    file_put_contents($rootDir . '/.env.example', implode("\n", array_map(function ($env) use ($environment) {
      return "# {$environment[$env]['description']}\n$env=\"{$environment[$env]['value']}\"\n";
    }, array_keys($environment))));
  }

}
