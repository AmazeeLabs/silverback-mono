<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Schema;

use Drupal\Component\Plugin\ConfigurableInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\PluginFormInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\Plugin\GraphQL\Schema\SdlSchemaPluginBase;
use GraphQL\Language\AST\ObjectTypeDefinitionNode;

/**
 * @Schema(
 *   id = "directable",
 *   name = "Directable schema"
 * )
 */
class DirectableSchema extends SdlSchemaPluginBase implements ConfigurableInterface, PluginFormInterface {
  use StringTranslationTrait;

  /**
   * Retrieves the raw schema definition string.
   *
   * @return string
   *   The schema definition.
   *
   * @throws \Exception
   */
  protected function getSchemaDefinition() {
    $file = $this->configuration['schema_definition'];
    if (!file_exists($file)) {
      throw new \Exception(sprintf('Schema definition file %s does not exist.', $file));
    }

    return file_get_contents($file) ?: NULL;
  }

  public function getResolverRegistry() {
    $registry = new ResolverRegistry();
    $extensions = $this->getExtensions();
    $builder = new ResolverBuilder();
    $document = $this->getSchemaDocument($extensions);

    foreach ($document->definitions as $definition) {
      if ($definition instanceof ObjectTypeDefinitionNode) {
        foreach($definition->fields as $field) {
          if ($field->directives) {
            foreach ($field->directives as $directive) {
              if ($directive->name->value == 'value') {
                foreach ($directive->arguments as $argument) {
                  if ($argument->name->value == 'json') {
                    $data = json_decode($argument->value->value);
                    $registry->addFieldResolver(
                      $definition->name->value,
                      $field->name->value,
                      $builder->fromValue($data)
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
    return $registry;
  }

  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form['schema_definition'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Schema definition'),
      '#default_value' => $this->configuration['schema_definition'],
      '#description' => $this->t('Path to the schema definition file. Relative to webroot.'),
    ];
    return $form;
  }

  public function getConfiguration() {
    return $this->configuration;
  }

  public function setConfiguration(array $configuration) {
    $this->configuration = $configuration;
  }

  public function defaultConfiguration() {
    return ['schema_definition' => 'schema.graphqls'];
  }

  public function validateConfigurationForm(
    array &$form,
    FormStateInterface $form_state
  ) {
    // Nothing to do here.
  }

  public function submitConfigurationForm(
    array &$form,
    FormStateInterface $form_state
  ) {
    // Nothing to do here.
  }

}
