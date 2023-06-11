<?php

namespace Drupal\silverback_gatsby\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\AlertCommand;
use Drupal\silverback_gatsby\GatsbyBuildTriggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class BuildController extends ControllerBase {

  protected GatsbyBuildTriggerInterface $buildTrigger;

  /**
   * Constructs a BuildController object.
   *
   * @param \Drupal\silverback_gatsby\GatsbyBuildTriggerInterface $buildTrigger
   */
  public function __construct(GatsbyBuildTriggerInterface $buildTrigger) {
    $this->buildTrigger = $buildTrigger;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('silverback_gatsby.build_trigger'),
    );
  }

  /**
   * Triggers a Gatsby build for the default GraphQL server.
   *
   * @return \Drupal\Core\Ajax\AjaxResponse
   */
  public function build() {
    $response = new AjaxResponse();
    $message = $this->buildTrigger->triggerDefaultServerLatestBuild();
    $response->addCommand(new AlertCommand($message));
    return $response;
  }

}
