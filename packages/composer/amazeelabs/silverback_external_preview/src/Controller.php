<?php

namespace Drupal\silverback_external_preview;

use Drupal\consumers\Entity\Consumer;
use Drupal\Core\Controller\ControllerBase;
use Drupal\node\NodeInterface;
use Symfony\Component\HttpFoundation\Request;
use Drupal\silverback_external_preview\BrowserSize;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\silverback_external_preview\ExternalPreviewLink;
use Drupal\Core\Extension\ModuleHandlerInterface;
/**
 * Provides the controller for the preview page.
 */
class Controller extends ControllerBase {

  /**
   * The consumer preview links.
   *
   * @var \Drupal\silverback_external_preview\ExternalPreviewLink
   */
  protected $externalPreviewLink;

  protected $moduleHandler;

  /**
   * Controller constructor.
   *
   * @param \Drupal\silverback_external_preview\ExternalPreviewLink $decoupledPreviewLinks
   *   The consumer preview links.
   */
  public function __construct(ExternalPreviewLink $externalPreviewLink, ModuleHandlerInterface $moduleHandler) {
    $this->externalPreviewLink = $externalPreviewLink;
    $this->moduleHandler = $moduleHandler;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static($container->get('silverback_external_preview.external_preview_link'), $container->get('module_handler'));
  }

  /**
   * Controller for the preview page.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *
   * @return array
   *   The render array.
   */
  public function preview(NodeInterface $node, Request $request) {
    $url = $this->externalPreviewLink->getPreviewUrl($node);
    $this->processUrl($url);

    return [
      '#title' => $this->t('@label', [
        '@label' => $this->t('Preview')
      ]),
      '#entity_label' => $this->t('@entityLabel',['@entityLabel' => $node->label()]),
      '#theme' => 'silverback_external_preview',
      '#attached' => [
        'library' => [
          'silverback_external_preview/preview',
        ],
      ],
      '#url' => $url,
      '#open_external_label' => $this->t('Open external'),
      '#entity_url' => $request->query->get('entity_url'),
      '#sizes' => $this->getBrowserSizes(),

    ];
  }

  protected function processUrl(&$url){
    $this->moduleHandler->alter('silverback_external_preview_url_alter', $url);
  }

  public function getBrowserSizes() {

      return [
        new BrowserSize(375, 500, 'Mobile', 'Mobile'),
        new BrowserSize(640, 500, 'Tablet', 'Tablet'),
        new BrowserSize(768, 800, 'Laptop', 'Laptop'),
        new BrowserSize(1024, 768, 'Desktop', 'Desktop'),
        new BrowserSize(-1, -1, 'Full', 'Full'),
      ];


  }

}
