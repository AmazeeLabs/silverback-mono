<?php

namespace Drupal\silverback_gatsby\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\user\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;

class PublisherController extends ControllerBase {

  /**
   * Checks if the current user has access to Publisher.
   */
  public function hasAccess() {
    // This is the TokenAuthUser.
    // The Publisher role is not assigned to the user,
    // it is only used to scope the consumer.
    /** @var \Drupal\Core\Session\AccountProxyInterface $user */
    $userAccount = $this->currentUser();
    // Verify permission against User entity.
    $userEntity = User::load($userAccount->id());
    if ($userEntity->hasPermission('access publisher')) {
      return new JsonResponse([
        'access' => TRUE,
      ], 200);
    }
    else {
      return new JsonResponse([
        'access' => FALSE,
      ], 403);
    }
  }

}
