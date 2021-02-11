<?php

namespace Drupal\webform_jsonschema;

use Drupal\webform\Entity\Webform;
use Drupal\webform\WebformMessageManagerInterface;
use Drupal\webform\WebformSubmissionForm;
use Drupal\webform\WebformSubmissionInterface;

/**
 * Handles webform submissions.
 */
class Submission {

  /**
   * @var \Drupal\webform_jsonschema\Transformer
   */
  protected $transformer;

  /**
   * Submission constructor.
   *
   * @param \Drupal\webform_jsonschema\Transformer $transformer
   */
  public function __construct(Transformer $transformer) {
    $this->transformer = $transformer;
  }

  /**
   * Handles webform submission.
   *
   * @param string $webform_id
   *   Webform ID.
   * @param array $data
   *   JSON data.
   *
   * @return array
   *   In case of a successful submission:
   *     [
   *       'saved' => TRUE,
   *       'userMessages' => [{string}, ...],
   *     ]
   *   In case of a failed submission:
   *     [
   *       'saved' => FALSE,
   *       'errors' => [
   *         [
   *           'message' => {string},
   *           'path' => {data-path-as-array},
   *           'userMessage' => {string},
   *         ],
   *         ...
   *       ],
   *     ]
   */
  public function submit($webform_id, $data) {
    $error_message = NULL;
    try {
      $webform = Webform::load($webform_id);
      if (!$webform) {
        return [
          'saved' => FALSE,
          'errors' => [
            [
              'message' => "Cannot load a webform with \"{$webform_id}\" ID.",
              'path' => [],
              'userMessage' => (string) t('Cannot find webform to submit.'),
            ],
          ],
        ];
      }
      $schema = $this->transformer->toJsonSchema($webform);
      $data = self::flattenData($data, $schema);
      $path_mapping = self::getPathMapping($schema);
      $result = WebformSubmissionForm::submitFormValues([
        'webform_id' => $webform_id,
        'data' => $data,
      ]);
      if (is_array($result)) {
        $errors = [];
        foreach ($result as $form_path => $error) {
          $mapped_path = isset($path_mapping[$form_path])
            ? $path_mapping[$form_path]
            : $form_path;
          $path = self::fromFormPath($mapped_path, $schema);
          $errors[] = [
            'message' => "Webform error. Form path: \"{$form_path}\". Mapped path: \"{$mapped_path}\".",
            'path' => $path,
            'userMessage' => strip_tags((string) $error),
          ];
        }
        return [
          'saved' => FALSE,
          'errors' => $errors,
        ];
      }
      elseif ($result instanceof WebformSubmissionInterface) {
        /** @var \Drupal\webform\WebformMessageManagerInterface $message_manager */
        $message_manager = \Drupal::service('webform.message_manager');
        $message_manager->setWebformSubmission($result);
        $message_array = $message_manager->build(WebformMessageManagerInterface::SUBMISSION_CONFIRMATION_MESSAGE);
        $message = trim(strip_tags(\Drupal::service('renderer')
          ->render($message_array)));
        return [
          'saved' => TRUE,
          'userMessages' => [
            $message,
          ],
        ];
      }
    }
    catch (\Exception $e) {
      watchdog_exception('webform_jsonschema', $e);
      $error_message = $e->getMessage();
    }
    return [
      'saved' => FALSE,
      'errors' => [
        [
          'message' => $error_message ? $error_message : 'There was an error submitting webform.',
          'path' => [],
          'userMessage' => (string) t('There was an error submitting webform.'),
        ],
      ],
    ];
  }

  /**
   * Transforms Drupal's form path to JSON data path.
   *
   * It is not necessary that "foo][bar][baz" will become ["foo", "bar", "baz"].
   * Sometimes Drupal's form path can contain items that do not present in the
   * JSON schema/data. Real world example:
   * - form path: "multivalue_text][items][0][item]"
   * - JSON path: ["multivalue_text", "0"]
   *
   * @param string $form_path
   * @param array $schema
   *
   * @return array
   */
  protected static function fromFormPath($form_path, $schema) {
    $result = [];
    foreach (explode('][', $form_path) as $key) {
      if (isset($schema['properties'][$key])) {
        $schema = $schema['properties'][$key];
        $result[] = $key;
        continue;
      }
      elseif ($schema['type'] === 'array' && is_numeric($key)) {
        $schema = $schema['items'];
        $result[] = $key;
      }
    }
    return $result;
  }

  /**
   * Returns path mapping for Webform error messages.
   *
   * @see \Drupal\webform_jsonschema\Submission::flattenData() to get the logic.
   *
   * @param array $schema
   * @param array $json_path
   * @param array $webform_path
   * @param array $result
   *
   * @return array
   *   The mapping array. Keys are form paths, values are data paths.
   */
  protected static function getPathMapping($schema, $json_path = [], $webform_path = [], &$result = NULL) {
    if ($result === NULL) {
      $result = [];
    }
    if (empty($schema['properties'])) {
      return $result;
    }
    foreach ($schema['properties'] as $key => $property) {
      if (!empty($schema['properties'][$key]['is_wrapper_element'])) {
        array_push($json_path, $key);
        if (empty($schema['properties'][$key]['is_composite_element'])) {
          self::getPathMapping($schema['properties'][$key], $json_path, $webform_path, $result);
        }
        else {
          array_push($webform_path, $key);
          self::getPathMapping($schema['properties'][$key], $json_path, $webform_path, $result);
          array_pop($webform_path);
        }
        array_pop($json_path);
      }
      else {
        if ($json_path !== $webform_path) {
          $result[implode('][', array_merge($webform_path, [$key]))] = implode('][', array_merge($json_path, [$key]));
        }
      }
    }
    return $result;
  }

  /**
   * Prepares JSON data for submission.
   *
   * Webform has two kinds of grouped elements:
   * - composite elements (e.g. address)
   * - field groups (e.g. fieldset)
   *
   * To represent form as JSON schema, we need to treat both kinds in the same
   * way. For example:
   *   [
   *     'address' => [
   *       'street' => {string},
   *       'number' => {string},
   *     ],
   *     'name_fieldset' => [
   *       'first_name' => {string},
   *       'last_name' => {string},
   *     ],
   *   ]
   * This is required to render the form in the proper way on the frontend.
   *
   * But on submission Webform module expects that composite element children
   * are nested on their parent, but field group children are not. Here is how
   * the above example should be passed to
   * WebformSubmissionForm::submitFormValues():
   *   [
   *     'address' => [
   *       'street' => {string},
   *       'number' => {string},
   *     ],
   *     'first_name' => {string},
   *     'last_name' => {string},
   *   ]
   *
   * @param $data
   * @param $schema
   *
   * @return array
   */
  protected static function flattenData($data, $schema) {
    $result = [];
    foreach ($data as $key => $value) {
      if (!empty($schema['properties'][$key]['is_wrapper_element']) && is_array($value)) {
        if (empty($schema['properties'][$key]['is_composite_element'])) {
          $result += self::flattenData($value, $schema['properties'][$key]);
        }
        else {
          $result[$key] = self::flattenData($value, $schema['properties'][$key]);
        }
      }
      else {
        $result[$key] = $value;
      }
    }
    return $result;
  }

}
