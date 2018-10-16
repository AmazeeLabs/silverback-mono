<?php

namespace AmazeeLabs\Silverback\Commands;

use GuzzleHttp\Client;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use ZipArchive;

class DownloadTests extends SilverbackCommand {

  protected function configure() {
    $this->setName('download-tests');
    $this->setAliases(['dt']);
    $this->setDescription('Download test specifications to Jira.');
  }

  protected function execute(InputInterface $input, OutputInterface $output) {
    parent::execute($input, $output);

    $this->fileSystem->mkdir('tests/cypress/integration');
    $required = ['SB_JIRA_HOST', 'SB_JIRA_USER', 'SB_JIRA_PASS', 'SB_JIRA_PROJECTS'];

    foreach ($required as $variable) {
      if (!getenv($variable)) {
        $output->writeln('<error>Missing required Jira credentials. Please provide them in your .env file.</error>');
        exit(1);
      }
    }

    foreach (explode(' ', getenv('SB_JIRA_PROJECTS')) as $info) {
      list($handle, $id) = explode(':', $info);
      $filename = $this->fileSystem->tempnam('/tmp/', 'svb');

      $client = new Client();
      $host = getenv('SB_JIRA_HOST');
      $url = "https://$host/rest/cucumber/1.0/project/$id/features?manual=false";
      $client->request('GET', $url, [
        'auth' => [getenv('SB_JIRA_USER'), getenv('SB_JIRA_PASS')],
        'sink' => $filename,
      ]);

      $archive = new ZipArchive();
      $archive->open($filename);
      $archive->extractTo($this->rootDirectory . '/tests/cypress/integration/' . $handle);
    }

  }
}
