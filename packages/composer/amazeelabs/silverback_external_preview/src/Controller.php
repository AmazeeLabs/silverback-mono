<?php

namespace Drupal\silverback_external_preview;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\TempStore\PrivateTempStoreFactory;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides the controller for the preview page.
 */
class Controller extends ControllerBase {

  /**ss
   * @var \Drupal\silverback_external_preview\ExternalPreviewLink
   */
  protected $externalPreviewLink;

  /**
   * @var \Drupal\Core\TempStore\PrivateTempStoreFactory
   */
  protected $tempstore;

  /**
   * Controller constructor.
   *
   * @param \Drupal\silverback_external_preview\ExternalPreviewLink $externalPreviewLink
   * @param \Drupal\Core\TempStore\PrivateTempStoreFactory $tempstore
   */
  public function __construct(ExternalPreviewLink $externalPreviewLink,PrivateTempStoreFactory $tempstore) {
    $this->externalPreviewLink = $externalPreviewLink;
    $this->tempstore = $tempstore;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static($container->get('silverback_external_preview.external_preview_link'), $container->get('tempstore.private'));
  }

  /**
   * Controller for the preview page.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *
   * @return array
   *   The render array.
   */
  public function preview(Request $request) {
    $preview_path = $request->get('preview-path');
    $tempstore = $this->tempstore->get('silverback_external_preview');
    $url = $tempstore->get($preview_path);
    return [
      '#title' => $this->t('@label', [
        '@label' => $this->t('Preview'),
      ]),
      '#theme' => 'silverback_external_preview',
      '#attached' => [
        'library' => [
          'silverback_external_preview/preview',
        ],
      ],
      '#url' => $url,
      '#open_external_label' => $this->t('Open external'),
      '#sizes' => $this->getBrowserSizes(),

    ];
  }

  public function getBrowserSizes() {

    return [
      new BrowserSize(375, 725, 'Mobile', 'Mobile'),
      new BrowserSize(1024, 824, 'Tablet', 'Tablet'),
      new BrowserSize(1366, 786, 'Laptop', 'Laptop'),
      new BrowserSize(1920, 1080, 'Desktop', 'Desktop'),
      new BrowserSize(-1, -1, 'Full', 'Full'),
    ];


  }

}
