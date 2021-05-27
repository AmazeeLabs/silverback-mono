<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\Messenger\MessengerInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class GatsbyUpdateTrigger implements GatsbyUpdateTriggerInterface {

  protected array $buildIds = [];
  protected Client $httpClient;
  protected MessengerInterface $messenger;

  /**
   * GatsbyUpdateTriggerDecorator constructor.
   *
   * @param \GuzzleHttp\Client $httpClient
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   */
  public function __construct(Client $httpClient, MessengerInterface $messenger) {
    $this->messenger = $messenger;
    $this->httpClient = $httpClient;
  }

  /**
   * {@inheritDoc}
   */
  public function trigger(string $server, int $id) : void {
    // Make sure the shutdown function is registered only once.
    if (!$this->buildIds) {
      drupal_register_shutdown_function([$this, 'sendUpdates']);
    }
    $this->buildIds[$server] = $id;
  }

  /**
   * {@inheritDoc}
   */
  public function sendUpdates() : void {
    foreach ($this->buildIds as $server => $id) {
      $varname = 'GATSBY_BUILD_HOOK_' . str_replace('-', '_', strtoupper($server));
      $urls = explode(';', getenv($varname)?: 'http://localhost:8000/__refresh');
      foreach ($urls as $url) {
        try {
          $this->httpClient->post($url, [
            'headers' => [
              // We have to pretend not to be Drupal, or Gatsby cloud will
              // apply "magic" that causes it not to re-run our sourceNodes
              // function.
              'User-Agent' => 'CMS',
            ],
            'json' => ['buildId' => $id],
          ]);
        } catch (RequestException $exc) {
          $this->messenger->addError('Could not send build notification to server "' . $server . '".');
          $this->messenger->addError($exc->getMessage());
        }
      }
    }
  }

}
