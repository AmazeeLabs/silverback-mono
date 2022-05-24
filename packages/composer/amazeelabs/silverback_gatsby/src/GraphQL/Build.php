<?php

namespace Drupal\silverback_gatsby\GraphQL;

use Drupal\Component\Plugin\ConfigurableInterface;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\HtmlCommand;
use Drupal\Core\Entity\EntityForm;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\SubformState;
use Drupal\Core\Plugin\PluginFormInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\graphql\Plugin\SchemaPluginManager;
use Drupal\silverback_gatsby\GatsbyUpdateTriggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Gatsby build specific configuration of the schema.
 *
 * @package Drupal\silverback_gatsby\GraphQL
 */
class Build extends EntityForm {

  /**
   * The schema plugin manager.
   *
   * @var \Drupal\graphql\Plugin\SchemaPluginManager
   */
  protected $schemaManager;

  /**
   * The Gatsby update trigger.
   *
   * @var \Drupal\silverback_gatsby\GatsbyUpdateTriggerInterface
   */
  protected $updateTrigger;

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * ServerForm constructor.
   *
   * @param \Drupal\graphql\Plugin\SchemaPluginManager $schemaManager
   *   The schema plugin manager.
   *
   * @codeCoverageIgnore
   */
  public function __construct(
    SchemaPluginManager $schemaManager,
    GatsbyUpdateTriggerInterface $updateTrigger,
    AccountProxyInterface $currentUser
  ) {
    $this->schemaManager = $schemaManager;
    $this->updateTrigger = $updateTrigger;
    $this->currentUser = $currentUser;
  }

  /**
   * {@inheritdoc}
   *
   * @codeCoverageIgnore
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('plugin.manager.graphql.schema'),
      $container->get('silverback_gatsby.update_trigger'),
      $container->get('current_user')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(
    array $form,
    FormStateInterface $form_state
  ) {
    $form = parent::buildForm($form, $form_state);

    $form['trigger_build'] = [
      '#type' => 'button',
      '#value' => $this->t('Gatsby Build'),
      '#required' => FALSE,
      '#ajax' => [
        'callback' => [$this, 'gatsbyBuild'],
      ],
      '#suffix' => '<span class="gatsby-build-message"></span>',
    ];

    /** @var \Drupal\graphql\Entity\ServerInterface $server */
    $server = $this->entity;
    $schema = $server->get('schema');
    $form['actions']['#access'] = $this->currentUser->hasPermission('administer graphql configuration');
    $form['schema_configuration'] = [
      '#type' => 'container',
      '#access' => $this->currentUser->hasPermission('administer graphql configuration'),
      '#prefix' => '<div id="edit-schema-configuration-plugin-wrapper">',
      '#suffix' => '</div>',
      '#tree' => TRUE,
    ];

    /** @var \Drupal\graphql\Plugin\SchemaPluginInterface $instance */
    $instance = $schema ? $this->schemaManager->createInstance($schema) : NULL;
    if ($instance instanceof PluginFormInterface && $instance instanceof ConfigurableInterface) {
      $instance->setConfiguration($server->get('schema_configuration')[$schema] ?? []);
      $form['schema_configuration'][$schema] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Build configuration'),
        '#tree' => TRUE,
      ];
      $form['schema_configuration'][$schema] += $instance->buildConfigurationForm([], $form_state);
    }
    return $form;
  }

  /**
   * Gatsby build.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   *
   * @return \Drupal\Core\Ajax\AjaxResponse
   *   AjaxResponse.
   */
  public function gatsbyBuild(array $form, FormStateInterface $form_state) {
    $response = new AjaxResponse();
    $buildMessage = $this->updateTrigger->triggerLatestBuild($this->entity->id());
    $response->addCommand(new HtmlCommand('.gatsby-build-message', $buildMessage));
    return $response;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);
    $server = $this->entity;
    $schema = $server->get('schema');
    /** @var \Drupal\graphql\Plugin\SchemaPluginInterface $instance */
    $instance = $this->schemaManager->createInstance($schema);
    if ($instance instanceof PluginFormInterface && $instance instanceof ConfigurableInterface) {
      $state = SubformState::createForSubform($form['schema_configuration'][$schema], $form, $form_state);
      $instance->submitConfigurationForm($form['schema_configuration'][$schema], $state);
    }
  }

  /**
   * {@inheritdoc}
   *
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   */
  public function save(array $form, FormStateInterface $form_state) {
    $save_result = parent::save($form, $form_state);
    $this->messenger()->addMessage($this->t('Saved the %label server.', [
      '%label' => $this->entity->label(),
    ]));

    $form_state->setRedirect('entity.graphql_server.collection');
    return $save_result;
  }

}
