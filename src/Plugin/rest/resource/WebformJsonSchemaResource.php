<?php

namespace Drupal\webform_jsonschema\Plugin\rest\resource;

use Drupal\rest\ResourceResponse;
use Drupal\webform\Entity\Webform;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\webform_jsonschema\Submission;
use Drupal\webform_jsonschema\Transformer;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
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
   * @var \Drupal\webform_jsonschema\Transformer
   */
  protected $transformer;

  /**
   * @var \Drupal\webform_jsonschema\Submission
   */
  protected $submission;

  /**
   * WebformJsonSchemaResource constructor.
   *
   * @param array $configuration
   * @param $plugin_id
   * @param $plugin_definition
   * @param array $serializer_formats
   * @param \Psr\Log\LoggerInterface $logger
   * @param \Drupal\webform_jsonschema\Transformer $transformer
   * @param \Drupal\webform_jsonschema\Submission $submission
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, array $serializer_formats, LoggerInterface $logger, Transformer $transformer, Submission $submission) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
    $this->transformer = $transformer;
    $this->submission = $submission;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('rest'),
      $container->get('webform_jsonschema.transformer'),
      $container->get('webform_jsonschema.submission')
    );
  }

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
        'schema' => $this->transformer->toJsonSchema($webform),
        'ui' => $this->transformer->toUiSchema($webform),
        /**
         * The buttons cannot be part of the schema. They need to be added as
         * children of the form element, so we put them under a separate key.
         * The items should be mapped in a way similar to this:
         *
         * <code>
         * <Form schema={schema} uiSchema={uiSchema} formData={formData}>
         *   {buttons.map(({ value }) => <button type="submit">{value}</button>}
         * </Form>
         * </code>
         */
        'buttons' => $this->transformer->toButtons($webform),
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
    $result = $this->submission->submit($webform_id, $data);
    return new \Drupal\rest\ModifiedResourceResponse($result, $result['saved'] ? 200 : 400);
  }

}
