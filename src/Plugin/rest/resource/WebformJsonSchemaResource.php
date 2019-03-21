<?php

namespace Drupal\webform_jsonschema\Plugin\rest\resource;

use Drupal\rest\ResourceResponse;
use Drupal\webform\Entity\Webform;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\webform_jsonschema\Submission;
use Drupal\webform_jsonschema\Transformer;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * JSON Schema for webforms.
 *
 * @RestResource(
 *   id = "webform_jsonschema",
 *   label = @Translation("Webform JSON Schema"),
 *   uri_paths = {
 *     "canonical" = "/webform_jsonschema/{webform_id}",
 *     "create" = "/webform_jsonschema/{webform_id}",
 *   }
 * )
 */
class WebformJsonSchemaResource extends ResourceBase {

  /**
   * Returns JSON Schema + UI Schema + Form Data for a webform.
   *
   * @param string $webform_id
   *   Webform ID.
   *
   * @return \Drupal\rest\ResourceResponseInterface
   */
  public function get($webform_id) {
    if ($webform = Webform::load($webform_id)) {
      /** @var \Drupal\Core\Access\CsrfTokenGenerator $token_generator */
      $token_generator = \Drupal::service('csrf_token');
      $response = new ResourceResponse([
        'schema' => Transformer::toJsonSchema($webform),
        'ui' => Transformer::toUiSchema($webform),
//        'data' => new \stdClass(),
        'csrfToken' => $token_generator->get(\Drupal\Core\Access\CsrfRequestHeaderAccessCheck::TOKEN_KEY),
      ]);
      $response->addCacheableDependency($webform);
      return $response;
    }
    throw new NotFoundHttpException(t('Cannot load webform.'));

  }

  /**
   * Handles JSON submission.
   */
  public function post($webform_id, $data) {
    $result = Submission::submit($webform_id, $data);
    return new \Drupal\rest\ModifiedResourceResponse($result, $result['saved'] ? 200 : 400);
  }

}
