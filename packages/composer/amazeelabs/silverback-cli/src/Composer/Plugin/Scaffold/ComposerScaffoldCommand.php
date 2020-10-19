<?php

namespace SilverbackCli\Composer\Plugin\Scaffold;

use Composer\Command\BaseCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * The "silverback-scaffold" command class.
 *
 * Manually run the scaffold operation that normally happens after
 * 'composer install'.
 *
 * @internal
 */
class ComposerScaffoldCommand extends BaseCommand {

  /**
   * {@inheritdoc}
   */
  protected function configure() {
    $this
      ->setName('silverback-scaffold')
      ->setAliases(['sscaffold'])
      ->setDescription('Update the Silverback scaffold files.')
      ->setHelp("Help for Silverback");
  }

  /**
   * {@inheritdoc}
   */
  protected function execute(InputInterface $input, OutputInterface $output) {
    $handler = new ScaffoldHandler($this->getComposer(), $this->getIO());
    $handler->scaffold();
    return 0;
  }

}
