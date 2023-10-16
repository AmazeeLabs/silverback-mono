<?php

use Drupal\user\Entity\Role;
use Drupal\user\RoleInterface;

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

/**
 * Add Publisher Consumer if it does not exist yet and delete the default one.
 */
function silverback_gatsby_oauth_post_update_set_consumers(&$sandbox) {
  // Skip for Silverback environments.
  // It might be used for OAuth development purpose only in Silverback
  // and can be set manually for this case.
  // Matches the default Publisher behavior
  // that disables Publisher OAuth for non Lagoon environments.
  if (getenv('SB_ENVIRONMENT')) {
    return;
  }

  // Check requirements.
  $entityTypeManager = \Drupal::entityTypeManager();
  $publisherRole = $entityTypeManager->getStorage('user_role')->load('publisher');
  if (!$publisherRole instanceof RoleInterface) {
    throw new \Exception('Publisher Role does not exist. It is required to setup the Publisher OAuth Consumer.');
  }

  $publisherUrl = getenv('PUBLISHER_URL');
  if (!$publisherUrl) {
    throw new \Exception('PUBLISHER_URL environment variable is not set. It is required to setup the Publisher OAuth Consumer.');
  }

  $clientSecret = getenv('PUBLISHER_OAUTH2_CLIENT_SECRET');
  if (!$clientSecret) {
    throw new \Exception('PUBLISHER_OAUTH2_CLIENT_SECRET environment variable is not set. It is required to setup the Publisher OAuth Consumer.');
  }

  $consumersStorage = $entityTypeManager->getStorage('consumer');
  $existingConsumers = $consumersStorage->loadMultiple();
  $hasPublisherConsumer = FALSE;
  /** @var \Drupal\consumers\Entity\ConsumerInterface $consumer */
  foreach($existingConsumers as $consumer) {
    // As a side effect, delete the default consumer.
    // It is installed by the Consumers module.
    if ($consumer->getClientId() === 'default_consumer') {
      $consumer->delete();
    }
    if ($consumer->getClientId() === 'publisher') {
      $hasPublisherConsumer = TRUE;
    }
  }

  // Create the Publisher Consumer if it does not exist.
  if (!$hasPublisherConsumer) {
    $oAuthCallback = $publisherUrl . '/oauth/callback';
    $consumersStorage->create([
      'label' => 'Publisher',
      'client_id' => 'publisher',
      'is_default' => TRUE,
      'secret' => $clientSecret,
      'redirect' => $oAuthCallback,
      'roles' => [
        'publisher',
      ],
    ])->save();
  }

}
