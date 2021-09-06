<?php

namespace Drupal\silverback_gatsby_test\Entity;

use Drupal\Core\Utility\Error;
use Drupal\graphql\Entity\Server as ServerOriginal;
use Drupal\graphql\GraphQL\Execution\ExecutionResult as CacheableExecutionResult;
use GraphQL\Server\OperationParams;

// TODO: Remove once https://github.com/drupal-graphql/graphql/issues/1195 is
//  implemented.
class Server extends ServerOriginal {

  public function executeOperation(OperationParams $operation) {
    $result = parent::executeOperation($operation);

    if ($result instanceof CacheableExecutionResult && !empty($result->errors)) {
      $isPreviousLogged = FALSE;
      foreach ($result->errors as $error) {
        if ($error->getPrevious() instanceof \Throwable) {
          _drupal_log_error(Error::decodeException($error->getPrevious()));
          $isPreviousLogged = TRUE;
        }
      }
      $debug = json_encode([
        '$operation' => $operation,
        // Do not pass $result to json_encode because it has own jsonSerialize
        // method which strips some data out.
        '$result->data' => $result->data,
        '$result->errors' => $result->errors,
        '$result->extensions' => $result->extensions,
      ]);
      \Drupal::logger('silverback_gatsby_test')->error(
        'There were errors during GraphQL execution. {previous}Debug: {debug}',
        [
          'previous' => $isPreviousLogged ? 'See previous log messages for error details. ' : '',
          'debug' => $debug,
        ]
      );
    }

    return $result;
  }

}
