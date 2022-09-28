<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Messenger\MessengerInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class GatsbyUpdateTrigger implements GatsbyUpdateTriggerInterface {

  /**
   * @var \Drupal\silverback_gatsby\GatsbyUpdate[][]
   */
  protected array $updates = [];

  protected Client $httpClient;
  protected EntityTypeManagerInterface $entityTypeManager;
  protected MessengerInterface $messenger;

  public function __construct(
    Client $httpClient,
    MessengerInterface $messenger,
    EntityTypeManagerInterface $entityTypeManager
  ) {
    $this->httpClient = $httpClient;
    $this->messenger = $messenger;
    $this->entityTypeManager = $entityTypeManager;
  }

  protected function getWebhook($server_id) {
    $server = $this->entityTypeManager
      ->getStorage('graphql_server')
      ->load($server_id);
    $schema_id = $server->get('schema');
    if (isset($server->get('schema_configuration')[$schema_id]['update_webhook'])) {
      return $server->get('schema_configuration')[$schema_id]['update_webhook'];
    }
    return NULL;
  }

  public function trigger(string $server, GatsbyUpdate $update): void {
    // Make sure the shutdown function is registered only once.
    if (!$this->updates) {
      drupal_register_shutdown_function([$this, 'sendUpdates']);
    }
    if ($url = $this->getWebhook($server)) {
      $this->updates[$url][] = $update;
    }
  }

  public function sendUpdates(): void {
    foreach ($this->updates as $url => $updates) {
      try {
        $this->httpClient->post($url, [
          'json' => array_map(fn ($update) => [
            'type' => $update->type,
            'id' => $update->id,
          ], $updates),
          // It can happen that a request hangs for too long time.
          'timeout' => 2,
        ]);
      } catch (RequestException $exc) {
        $this->messenger->addError('Could not send build notification to server "' . $url . '".');
        $this->messenger->addError($exc->getMessage());
      }
    }
  }

}
