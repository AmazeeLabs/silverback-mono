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
use Drupal\silverback_gatsby\GatsbyBuildTriggerInterface;
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
   * @var \Drupal\silverback_gatsby\GatsbyBuildTriggerInterface
   */
  protected $buildTrigger;

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
    GatsbyBuildTriggerInterface $buildTrigger,
    AccountProxyInterface $currentUser
  ) {
    $this->schemaManager = $schemaManager;
    $this->buildTrigger = $buildTrigger;
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
      $container->get('silverback_gatsby.build_trigger'),
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
    /** @var \Drupal\graphql\Entity\ServerInterface $server */
    $server = $this->entity;
    $schema = $server->get('schema');
    $enabled = (bool) $this->entity->get('schema_configuration')[$schema]['extensions']['silverback_gatsby'];
    if (!$enabled) {
      $form['message'] = [
        '#type' => 'html_tag',
        '#tag' => 'p',
        '#value' => $this->t('The Gatsby extension is not enabled for this schema.'),
      ];
      return $form;
    }

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
      $configuration = $server->get('schema_configuration');
      $form['schema_configuration'][$schema] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Build configuration'),
        '#tree' => TRUE,
      ];

      $buildSettings['build_trigger_on_save'] = [
        '#type' => 'checkbox',
        '#required' => FALSE,
        '#title' => $this->t('Trigger a build on entity save.'),
        '#description' => $this->t('If not checked, make sure to have an alternate build method (cron, manual).'),
        '#default_value' => $configuration[$schema]['build_trigger_on_save'] ?? '',
      ];
      $buildSettings['build_webhook'] = [
        '#type' => 'textfield',
        '#required' => FALSE,
        '#title' => $this->t('Build webhook'),
        '#description' => $this->t('A webhook that will be notified when content changes relevant to this server happen.'),
        '#default_value' => $configuration[$schema]['build_webhook'] ?? '',
      ];
      $buildSettings['update_webhook'] = [
        '#type' => 'textfield',
        '#required' => FALSE,
        '#title' => $this->t('Update webhook'),
        '#description' => $this->t('A webhook to notify clients about realtime data updates.'),
        '#default_value' => $configuration[$schema]['update_webhook'] ?? '',
      ];
      $buildSettings['build_url'] = [
        '#type' => 'url',
        '#required' => FALSE,
        '#title' => $this->t('Build url'),
        '#description' => $this->t('The frontend url that is the result of the build. With the scheme and without a trailing slash (https://www.example.com).'),
        '#default_value' => $configuration[$schema]['build_url'] ?? '',
      ];
      $buildSettings['build_url_netlify_password'] = [
        '#type' => 'textfield',
        '#required' => FALSE,
        '#title' => $this->t('Netlify password for "Build url"'),
        '#description' => $this->t('If "Build url" is hosted on Netlify and is password protected.'),
        '#default_value' => $configuration[$schema]['build_url_netlify_password'] ?? '',
      ];

      /** @var \Drupal\graphql\Form\ServerForm $formObject */
      $formObject = $form_state->getFormObject();
      /** @var \Drupal\graphql\Entity\Server $server */
      $server = $formObject->getEntity();

      $buildSettings['user'] = [
        '#type' => 'select',
        '#options' => ['' => $this->t('- None -')],
        '#title' => $this->t('Notification user'),
        '#description' => $this->t('Only changes visible to this user will trigger build updates.'),
        '#default_value' => $configuration[$schema]['user'] ?? '',
        '#states'=> [
          'required' => [
            ':input[name="schema_configuration[' . $server->schema . '][extensions][silverback_gatsby]"]' => ['checked' => TRUE],
          ],
        ],
      ];
      $users = [];
      /** @var \Drupal\user\UserInterface $user */
      foreach ($this->entityTypeManager->getStorage('user')->loadMultiple() as $user) {
        $users[$user->uuid()] = $user->getAccountName() === '' ? 'Anonymous' : $user->getAccountName();
      }
      natcasesort($users);
      $buildSettings['user']['#options'] += $users;
      $form['schema_configuration'][$schema] += $buildSettings;
    }
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function buildEntity(array $form, FormStateInterface $form_state) {
    $entity = clone $this->entity;
    $entity->schema_configuration[$entity->schema] = array_merge($entity->schema_configuration[$entity->schema], $form_state->getValue('schema_configuration')[$entity->schema]);
    return $entity;
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
    $buildMessage = $this->buildTrigger->triggerLatestBuild($this->entity->id());
    $response->addCommand(new HtmlCommand('.gatsby-build-message', $buildMessage));
    return $response;
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
