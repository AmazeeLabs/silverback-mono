<?php

namespace Drupal\test_session\Negotiator;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\workspaces\Negotiator\WorkspaceNegotiatorInterface;
use Drupal\workspaces\WorkspaceInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class WorkspaceNegotiator implements WorkspaceNegotiatorInterface {

  /**
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $workspaceStorage;

  /**
   * @var \Symfony\Component\HttpFoundation\Session\SessionInterface
   */
  protected $session;

  public function __construct(EntityTypeManagerInterface $entity_type_manager, SessionInterface $session) {
    $this->session = $session;
    $this->workspaceStorage = $entity_type_manager->getStorage('workspace');
  }

  /**
   * {@inheritDoc}
   */
  public function applies(Request $request) {
    return test_session_enabled() && $this->session->has('TEST_SESSION_WORKSPACE');
  }

  /**
   * {@inheritDoc}
   */
  public function getActiveWorkspace(Request $request) {
    $workspaceId = $this->session->get('TEST_SESSION_WORKSPACE');
    $workspace = $this->workspaceStorage->load($workspaceId);
    return $workspace;
  }

  /**
   * {@inheritDoc}
   *
   * @return void
   */
  public function setActiveWorkspace(WorkspaceInterface $workspace) {}

  /**
   * {@inheritDoc}
   *
   * @return void
   */
  public function unsetActiveWorkspace() {}

}
