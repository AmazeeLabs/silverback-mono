<?php

use Drupal\user\Entity\Role;

/**
 * Introduce "view publisher status" permission.
 */
function silverback_gatsby_post_update_introduce_view_publisher_status_permission(&$sandbox): void {
  foreach (Role::loadMultiple() as $role) {
    // The status was visible for everyone who could see the toolbar.
    if ($role->hasPermission('access toolbar')) {
      $role->grantPermission('view publisher status')->save();
    }
  }
}
