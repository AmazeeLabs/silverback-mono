<?php

namespace Drupal\test_session\Authentication\Provider;

use Drupal\Core\Authentication\AuthenticationProviderFilterInterface;
use Drupal\Core\Authentication\AuthenticationProviderInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountProxy;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class AuthenticationProvider implements AuthenticationProviderInterface, AuthenticationProviderFilterInterface {

  /**
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $userStorage;

  /**
   * @var SessionInterface
   */
  protected $session;

  /**
   * @var EventDispatcherInterface
   */
  protected $eventDispatcher;

  public function __construct(EntityTypeManagerInterface $entity_type_manager, SessionInterface $session, EventDispatcherInterface $eventDispatcher) {
    $this->session = $session;
    $this->userStorage = $entity_type_manager->getStorage('user');
    $this->eventDispatcher = $eventDispatcher;
  }

  /**
   * {@inheritDoc}
   */
  public function applies(Request $request) {
    return test_session_enabled() && $this->session->has('TEST_SESSION_USER');
  }

  /**
   * {@inheritDoc}
   */
  public function authenticate(Request $request) {
    $username = $this->session->get('TEST_SESSION_USER');
    if ($username) {
      // Do not use the entity query to prevent a tricky issue with workspaces.
      // See https://github.com/AmazeeLabs/silverback-mono/issues/545
      $uid = \Drupal::database()
        ->select('users_field_data', 'u')
        ->fields('u', ['uid'])
        ->condition('u.name', $username)
        ->execute()
        ->fetchField();
      if ($uid) {
        // Same here. Avoid loading the user entity.
        $accountProxy = new AccountProxy($this->eventDispatcher);
        $accountProxy->setInitialAccountId($uid);
        return $accountProxy;
      }
    }
    return NULL;
  }

  /**
   * {@inheritDoc}
   */
  public function appliesToRoutedRequest(Request $request, $authenticated) {
    return test_session_enabled() && $this->session->has('TEST_SESSION_USER');
  }

}
