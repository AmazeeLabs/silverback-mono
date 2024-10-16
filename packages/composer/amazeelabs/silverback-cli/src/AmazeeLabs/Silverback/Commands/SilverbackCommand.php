<?php

namespace AmazeeLabs\Silverback\Commands;

use Dotenv\Dotenv;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ConfirmationQuestion;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class SilverbackCommand extends Command {

  /**
   * @var \Symfony\Component\Filesystem\Filesystem
   */
  protected $fileSystem;

  /**
   * The current project root directory.
   *
   * @var string
   */
  protected $rootDirectory;

  /**
   * {@inheritDoc}
   */
  protected function configure() {
    parent::configure();
    $this->addOption('yes', 'y', null, 'Reply "yes" to all questions.');
  }

  protected function executeProcess(array $command, OutputInterface $output) {
    $process = new Process($command, getcwd(), NULL, NULL, NULL);
    $process->start();
    $output->writeln('<comment>Executing command: ' . $process->getCommandLine() . '</>');
    foreach ($process as $type => $line) {
      $output->write($line);
    }
    if (!$process->isSuccessful()) {
      throw new ProcessFailedException($process);
    }
  }

  public function __construct(Filesystem $fileSystem) {
    parent::__construct();
    $this->fileSystem = $fileSystem;
    if ($fileSystem->exists('.env')) {
      $env = Dotenv::createImmutable(getcwd());
      $env->safeLoad();
    }
  }

  /**
   * {@inheritdoc}
   */
  protected function execute(InputInterface $input, OutputInterface $output): int {
    if (!file_exists('composer.json')) {
      $output->writeln('<error>composer.json not found. Please run this command from composer based Drupal installations root directory.</>');
      exit(1);
    }
    // TODO: scan upwards and detect root directory?
    $this->rootDirectory = getcwd();

    return 0;
  }

  protected function copyDir($source, $destination) {
    if ($this->fileSystem->exists($destination)) {
      $this->fileSystem->mkdir($destination);
    }
    $finder = new Finder();
    $finder->files()->in($source);
    $finder->ignoreDotFiles(FALSE);
    foreach ($finder as $file) {
      $this->fileSystem->copy(
        rtrim($source, '/') . '/' . $file->getRelativePath() . '/' . $file->getFilename(),
        rtrim($destination) . '/' . $file->getRelativePath() . '/' . $file->getFilename()
      );
    }
  }

  protected function cleanDir($source) {
    if ($this->fileSystem->exists($source)) {
      $finder = new Finder();
      $finder->files()->in($source);
      $finder->ignoreDotFiles(FALSE);
      foreach ($finder as $file) {
        $this->fileSystem->remove($file->getPathname());
      }
    }
  }

  protected function getConfigDirectory() {
    $configDir = 'config/sync';
    if (!$this->fileSystem->exists('config/sync')) {
      $this->fileSystem->mkdir('config/sync');
    }
    return $configDir;
  }

  protected function getConfigHash() {
    $configDir = $this->getConfigDirectory();

    $finder = new Finder();
    $finder->files()->in($this->rootDirectory . '/' . $configDir);
    $files = [];
    foreach ($finder as $file) {
      $files[] = md5(file_get_contents($file->getRealPath()));
    }

    return md5(serialize($files));
  }

  protected function confirm(InputInterface $input, OutputInterface $output, string $question) {
    if ($input->getOption('yes')) {
      $output->writeln("<question>$question</question>yes");
      return true;
    }
    /** @var \Symfony\Component\Console\Helper\QuestionHelper $helper */
    $helper = $this->getHelper('question');
    return $helper->ask($input, $output, new ConfirmationQuestion("<question>$question</question>", true));
  }

}
