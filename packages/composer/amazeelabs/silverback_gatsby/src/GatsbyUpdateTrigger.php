<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\graphql\Entity\ServerInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class GatsbyUpdateTrigger implements GatsbyUpdateTriggerInterface {

  use StringTranslationTrait;

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

  /**
   * {@inheritDoc}
   */
  public function triggerLatestBuild(string $server) : TranslatableMarkup {
    $servers = $this->entityTypeManager
      ->getStorage('graphql_server')
      ->loadByProperties(['name' => $server]);

    if (empty($servers)) {
      $message = $this->t('No server found with id @server_id.', [
        '@server_id' => $server,
      ]);
      $this->messenger->addError($message);
      return $message;
    }

    $serverEntity = reset($servers);
    if ($serverEntity instanceof ServerInterface) {
      // No dependency injection, prevent circular reference.
      /** @var \Drupal\silverback_gatsby\GatsbyUpdateTrackerInterface $updateTracker */
      $updateTracker = \Drupal::service('silverback_gatsby.update_tracker');
      $latestBuildId = $updateTracker->latestBuild($serverEntity->id());
      if (!$this->isFrontendLatestBuild($latestBuildId, $serverEntity)) {
        $message = $this->t('Triggering a build for server @server_id.', [
          '@server_id' => $server,
        ]);
        $this->messenger->addStatus($message);
        $this->trigger($serverEntity->id(), $latestBuildId);
      }
      else {
        $message = $this->t('Build is already up-to-date for server @server_id.', [
          '@server_id' => $server,
        ]);
        $this->messenger->addStatus($message);
      }
    }

    return $message;
  }

  /**
   * Check on the frontend if the latest build already occurred.
   *
   * If the build url is not configured, presume false so the build
   * will still happen.
   *
   * @param string $latestBuildId
   * @param \Drupal\graphql\Entity\ServerInterface $serverEntity
   *
   * @return bool
   */
  protected function isFrontendLatestBuild(int $latestBuildId, ServerInterface $serverEntity) {
    $result = FALSE;
    $configuration = $serverEntity->get('schema_configuration')[$serverEntity->get('schema')];
    if (!empty($configuration['build_url'])) {
      $response = $this->httpClient->get($configuration['build_url'] . '/build.json');
      if ($response->getStatusCode() === 200) {
        $content = json_decode($response->getBody()->getContents(), TRUE);
        $buildId = array_key_exists('drupalBuildId', $content) ? (int) $content['drupalBuildId'] : 0;
        $result = $latestBuildId === $buildId;
      }
    }
    return $result;
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
