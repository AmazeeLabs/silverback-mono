<?php

namespace Drupal\silverback_graphql_persisted\Plugin\GraphQL\PersistedQuery;

use Drupal\Core\Site\Settings;
use Drupal\graphql\PersistedQuery\PersistedQueryPluginBase;
use GraphQL\Server\OperationParams;

/**
 * @PersistedQuery(
 *   id = "silverback_graphql_persisted",
 *   label = "Silverback Persisted Query",
 * )
 */
class PersistedQueryPlugin extends PersistedQueryPluginBase {

  /**
   * {@inheritdoc}
   */
  public function getQuery($id, OperationParams $operation) {
    $map = Settings::get('silverback_graphql_persisted_map');
    if (!$map) {
      $this->messenger()->addError('The "silverback_graphql_persisted_map" setting is not set');
      return NULL;
    }
    $file = DRUPAL_ROOT . '/' . $map;
    try {
      $queryMap = json_decode(file_get_contents($file));
    }
    catch (\Throwable $e) {
      $this->messenger()->addError("Cannot read the map from \"{$file}\": {$e->getMessage()}");
      return NULL;
    }
    return $queryMap->{$id} ?? NULL;
  }

}
