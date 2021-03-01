<?php

namespace Drupal\test_session\Plugin\LanguageNegotiation;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\language\LanguageNegotiationMethodBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

/**
 * @LanguageNegotiation(
 *   id = "language-test-session",
 *   weight = -9999,
 *   name = @Translation("Test Session"),
 *   description = @Translation("Use the language defined by the Test Session module.")
 * )
 */
class LanguageNegotiation extends LanguageNegotiationMethodBase implements ContainerFactoryPluginInterface {

  /**
   * @var \Symfony\Component\HttpFoundation\Session\SessionInterface
   */
  protected $session;

  public function __construct(SessionInterface $session) {
    $this->session = $session;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static($container->get('session'));
  }

  /**
   * {@inheritDoc}
   */
  public function getLangcode(Request $request = NULL) {
    return (test_session_enabled() && $request)
      ? $this->session->get('TEST_SESSION_LANGUAGE', FALSE)
      : FALSE;
  }

}
