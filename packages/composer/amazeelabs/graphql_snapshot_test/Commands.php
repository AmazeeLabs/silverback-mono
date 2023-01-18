<?php

namespace Drush\Commands\graphql_snapshot_test;

use Drush\Commands\DrushCommands;
use Drush\Drush;
use GraphQL\Server\OperationParams;

class Commands extends DrushCommands {

  /**
   * Run GraphQL snapshot tests.
   *
   * @command graphql:snapshot:test
   * @aliases gst
   *
   * @bootstrap full
   *
   * @param string $path
   *   Path to a directory containing .gql files or to a particular .gql file.
   *   Absolute, or relative to Drupal root.
   *
   * @option update
   *   Whether to create/update snapshots.
   *
   * @option servers
   *   Comma separated list of server IDs. If used, only the passed servers will
   *   be used for running queries. The order is respected.
   *
   * @usage drush gst graphql_tests
   *   Test all queries from graphql_tests directory.
   * @usage drush gst graphql_tests content/media/Image.gql
   *   Test graphql_tests/content/media/Image.gql query.
   * @usage drush gst graphql_tests content/media --update
   *   Run all queries from graphql_tests/content/media directory and update
   *   snapshots.
   *
   * @return int
   *   Exit code.
   */
  public function graphqlSnapshotTest(string $path, array $options = [
    'servers' => self::OPT,
  ]): int {
    /** @var \Drupal\Core\Session\AccountSwitcherInterface $accountSwitcher */
    $accountSwitcher = \Drupal::service('account_switcher');

    $serversNames = $options['servers'] ? explode(',', $options['servers']) : NULL;
    /** @var \Drupal\graphql\Entity\Server[] $servers */
    $servers = \Drupal::entityTypeManager()->getStorage('graphql_server')->loadMultiple($serversNames);

    if (!file_exists($path)) {
      $path = DRUPAL_ROOT . DIRECTORY_SEPARATOR . $path;
      if (!file_exists($path)) {
        $this->logger()->error("{$path} does not exist.");
        return 1;
      }
    }

    $path = realpath($path);

    if (is_dir($path)) {
      $files = array_keys(
        iterator_to_array(
          new \RegexIterator(
            new \RecursiveIteratorIterator(
              new \RecursiveDirectoryIterator($path)
            ),
            '/^.+\.gql$/i'
          )
        )
      );
    }
    else {
      $files = [$path];
    }

    $failed = FALSE;
    foreach ($files as $file) {
      $query = file_get_contents($file);
      $results = [];
      foreach ($servers as $server) {
        $user = NULL;
        $userUuid = $server->schema_configuration[$server->schema]['user'] ?? NULL;
        if ($userUuid) {
          $user = \Drupal::service('entity.repository')->loadEntityByUuid('user', $userUuid);
          if ($user) {
            $accountSwitcher->switchTo($user);
          }
        }
        $this->doWorkaround();
        $result = $server->executeOperation(
          OperationParams::create(['query' => $query])
        )->jsonSerialize();
        $results[$server->id()] = $this->cleanErrors($result);
        $results = $this->groupResults($results);
        array_walk($results, [$this, 'maskResults']);
        \Drupal::moduleHandler()->alter('graphql_snapshot_test_results', $results);
        if ($user) {
          $accountSwitcher->switchBack();
        }
      }
      $json = json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
      if (!$this->processSnapshots($file, $json, $options['update'])) {
        $failed = TRUE;
      }
    }

    if ($failed) {
      $this->logger()->error('Some snapshots mismatched. See above.');
      return 1;
    }

    if ($options['update']) {
      $this->logger()->success('Snapshots updated.');
    }
    else {
      $this->logger()->success('Snapshots matched.');
    }
    return 0;
  }

  protected function cleanErrors(array $result): array {
    if (isset($result['errors'])) {
      foreach ($result['errors'] as &$error) {
        unset($error['extensions']);
        unset($error['locations']);
      }
    }
    return $result;
  }

  protected function groupResults(array $results): array {
    $groups = [[
      'keys' => [key($results)],
      'result' => array_shift($results),
    ]];
    foreach ($results as $key => $result) {
      $found = FALSE;
      foreach ($groups as &$group) {
        if ($result === $group['result']) {
          $group['keys'][] = $key;
          $found = TRUE;
          break;
        }
      }
      unset($group);
      if (!$found) {
        $groups[] = [
          'keys' => [$key],
          'result' => $result,
        ];
      }
    }

    $grouped = [];
    foreach ($groups as $group) {
      $grouped[implode(' & ', $group['keys'])] = $group['result'];
    }

    return $grouped;
  }

  protected function maskResults(&$result, $key) {
    if (is_array($result)) {
      array_walk($result, [$this, 'maskResults']);
    }
    else {
      // Silverback Gatsby numeric IDs.
      if (
        $key === 'id' &&
        is_string($result) &&
        preg_match('/^[0-9]+(:[^:]+)?$/', $result)
      ) {
        $result = preg_replace('/^([0-9]+)(:[^:]+)?$/', '[numeric]$2', $result);
      }
      // Silverback Gatsby numeric IDs.
      elseif (
        $key === 'drupalId' &&
        is_string($result) &&
        preg_match('/^[0-9]+$/', $result)
      ) {
        $result = '[numeric]';
      }
      // Drupal internal paths.
      elseif (
        $key === 'path' &&
        is_string($result) &&
        preg_match('~^.*/[0-9]+$~', $result)
      ) {
        $result = preg_replace('~^(.*/)[0-9]+$~', '$1[numeric]', $result);
      }
      // "data-id" attributes in Gutenberg links.
      elseif (
        is_string($result) &&
        preg_match('/<a.*\sdata-id="\d+"/', $result)
      ) {
        $result = preg_replace('/(<a.*\s)data-id="\d+"/', '$1data-id="[numeric]"', $result);
      }
    }
  }

  protected function processSnapshots(string $file, string $json, bool $update): bool {
    if ($update) {
      file_put_contents($file . '.snapshot', $json);
      $this->logger()->info("{$file} snapshot updated.");
      return TRUE;
    }

    $jsonSnapshot = file_get_contents($file . '.snapshot');
    if ($jsonSnapshot === FALSE) {
      $this->logger()->error("{$file} snapshot does not exist.");
      return FALSE;
    }
    if ($jsonSnapshot !== $json) {
      $this->logger()->error("{$file} snapshot does not match.\n" . $this->diff($file, $json));
      return FALSE;
    }

    $this->logger()->info("{$file} snapshot matches.");
    return TRUE;
  }

  protected function diff(string $file, string $actual): string {
    $temp = tempnam(sys_get_temp_dir(), 'graphql_snapshot_test');
    file_put_contents($temp, $actual);

    $prefix = ['diff'];
    if (self::programExists('git') && $this->output()->isDecorated()) {
      $prefix = ['git', 'diff', '--color=always'];
    }
    $args = array_merge($prefix, ['-u', $temp, $file . '.snapshot']);
    $process = Drush::process($args);
    $process->run();
    $diff = $process->getOutput();
    unlink($temp);

    return $diff;
  }

  protected static function doWorkaround() {
    // Workaround for a bug that existed in amazeelabs/silverback_gatsby v1.
    // It was already fixed in v2. But we keep the workaround for BC.
    drupal_static_reset('Drupal\silverback_gatsby\GraphQL\ComposableSchema::getExtensions');
  }

}
