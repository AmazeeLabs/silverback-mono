<?php

namespace Drupal\silverback_raw_redirect;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;

class RawRdirectAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritDoc}
   */
  public function access(EntityInterface $entity, $operation, AccountInterface $account = NULL, $return_as_object = FALSE) {
    $account = $this->prepareUser($account);
    if ($operation === 'view label' && !$this->viewLabelOperation) {
      $operation = 'view';
    }
    // Everyone with the "access content" permission should be able to view
    // these redirects, otherwise they won't be accessible via graphql.
    if ($operation === 'view' && $account->hasPermission('access content')) {
      $result = AccessResult::allowed()->cachePerPermissions();
      return $return_as_object ? $result : $result->isAllowed();
    }
    return parent::access($entity, $operation, $account, TRUE);
  }
}
