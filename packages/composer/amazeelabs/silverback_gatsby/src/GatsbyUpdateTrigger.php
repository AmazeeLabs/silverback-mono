<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Messenger\MessengerInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class GatsbyUpdateTrigger implements GatsbyUpdateTriggerInterface {

  protected array $buildIds = [];
  protected Client $httpClient;
  protected MessengerInterface $messenger;
  protected EntityTypeManagerInterface $entityTypeManager;

  /**
   * GatsbyUpdateTriggerDecorator constructor.
   *
   * @param \GuzzleHttp\Client $httpClient
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   */
  public function __construct(
    Client $httpClient,
    MessengerInterface $messenger,
    EntityTypeManagerInterface $entityTypeManager
  ) {
    $this->messenger = $messenger;
    $this->httpClient = $httpClient;
    $this->entityTypeManager = $entityTypeManager;
  }

  /**
   * {@inheritDoc}
   */
  public function trigger(string $server, int $id) : void {
    // Make sure the shutdown function is registered only once.
    if (!$this->buildIds) {
      drupal_register_shutdown_function([$this, 'sendUpdates']);
    }
    if ($url = $this->getWebhook($server)) {
      $this->buildIds[$url] = $id;
    }
  }

  protected function getWebhook($server_id) {
    $server = $this->entityTypeManager
      ->getStorage('graphql_server')
      ->load($server_id);
    $schema_id = $server->get('schema');
    if (isset($server->get('schema_configuration')[$schema_id]['build_webhook'])) {
      return $server->get('schema_configuration')[$schema_id]['build_webhook'];
    }
    return NULL;
  }

  /**
   * {@inheritDoc}
   */
  public function sendUpdates() : void {
    foreach ($this->buildIds as $url => $id) {
      try {
        $this->httpClient->post($url, [
          'headers' => [
            // We have to pretend not to be Drupal, or Gatsby cloud will
            // apply "magic" that causes it not to re-run our sourceNodes
            // function.
            'User-Agent' => 'CMS',
          ],
          'json' => ['buildId' => $id],
          // It can happen that a request hangs for too long time.
          'timeout' => 2,
        ]);
        if (
          function_exists('_gatsby_build_monitor_state') &&
          // This detects the "build" webhook.
          strpos($url, '/data_source/publish/') !== FALSE
        ) {
          _gatsby_build_monitor_state('building');
        }
      } catch (RequestException $exc) {
        $this->messenger->addError('Could not send build notification to server "' . $url . '".');
        $this->messenger->addError($exc->getMessage());
      }
    }
  }

}
