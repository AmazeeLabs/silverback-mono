<?php

namespace Drupal\silverback_gatsby\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Checks if the current user has access to Publisher.
 */
class PublisherController extends ControllerBase {

  /**
   * Processes a GET or POST request.
   */
  public function authenticate() {
    /** @var \Drupal\Core\Session\AccountProxyInterface $user */
    $user = $this->currentUser();
    if ($user->hasPermission('access publisher')) {
      return new JsonResponse([
        'authenticated' => TRUE,
      ], 200);
    }
    else {
      return new JsonResponse([
        'authenticated' => FALSE,
      ], 403);
    }
  }

}
