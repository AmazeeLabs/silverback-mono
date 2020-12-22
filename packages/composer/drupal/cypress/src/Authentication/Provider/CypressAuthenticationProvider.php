<?php

namespace Drupal\cypress\Authentication\Provider;

use Drupal\Core\Authentication\AuthenticationProviderFilterInterface;
use Drupal\Core\Authentication\AuthenticationProviderInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountProxy;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class CypressAuthenticationProvider implements AuthenticationProviderInterface, AuthenticationProviderFilterInterface {

  /**
   * The user storage.
   *
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

  /**
   * LocaleWorkspaceNegotiator constructor.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   * @param \Symfony\Component\HttpFoundation\Session\SessionInterface $session
   * @param \Symfony\Component\EventDispatcher\EventDispatcherInterface $eventDispatcher
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, SessionInterface $session, EventDispatcherInterface $eventDispatcher) {
    $this->session = $session;
    $this->userStorage = $entity_type_manager->getStorage('user');
    $this->eventDispatcher = $eventDispatcher;
  }

  /**
   * {@inheritDoc}
   */
  public function applies(Request $request) {
    return cypress_enabled() && ($this->session->has('CYPRESS_USER') || $request->headers->has('X-CYPRESS-USER'));
  }

  /**
   * @param Request $request
   *
   * @return string
   */
  protected function getUserFromRequest(Request $request) {
    return $request->headers->get('X-CYPRESS-USER') ?: $this->session->get('CYPRESS_USER');
  }

  /**
   * {@inheritDoc}
   */
  public function authenticate(Request $request) {
    $username = $this->getUserFromRequest($request);
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
    return cypress_enabled() && ($this->session->has('CYPRESS_USER') || $request->headers->has('X-CYPRESS-USER'));
  }

}
