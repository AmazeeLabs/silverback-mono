<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\TranslatableInterface;
use Drupal\Core\Path\PathValidatorInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\Buffers\EntityBuffer;
use Drupal\graphql\GraphQL\Buffers\EntityRevisionBuffer;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use GraphQL\Deferred;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @todo Add an option to upstream "entity_load" to return null on missing
 *       translation and remove this plugin.
 *
 * Loads a single entity.
 *
 * @DataProducer(
 *   id = "fetch_entity",
 *   name = @Translation("Fetch entity"),
 *   description = @Translation("Loads a single entity."),
 *   produces = @ContextDefinition("entity",
 *     label = @Translation("Entity")
 *   ),
 *   consumes = {
 *     "type" = @ContextDefinition("string",
 *       label = @Translation("Entity type")
 *     ),
 *     "id" = @ContextDefinition("string",
 *       label = @Translation("Identifier"),
 *       required = FALSE
 *     ),
 *     "revision_id" = @ContextDefinition("string",
 *       label = @Translation("A specific revision id to fetch"),
 *       required = FALSE
 *     ),
 *     "language" = @ContextDefinition("string",
 *       label = @Translation("Entity language"),
 *       required = FALSE
 *     ),
 *     "bundles" = @ContextDefinition("string",
 *       label = @Translation("Entity bundle(s)"),
 *       multiple = TRUE,
 *       required = FALSE
 *     ),
 *     "access" = @ContextDefinition("boolean",
 *       label = @Translation("Check access"),
 *       required = FALSE,
 *       default_value = TRUE
 *     ),
 *     "access_user" = @ContextDefinition("entity:user",
 *       label = @Translation("User"),
 *       required = FALSE,
 *       default_value = NULL
 *     ),
 *     "access_operation" = @ContextDefinition("string",
 *       label = @Translation("Operation"),
 *       required = FALSE,
 *       default_value = "view"
 *     )
 *   }
 * )
 */
class FetchEntity extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The entity type manager service.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The entity repository service.
   *
   * @var \Drupal\Core\Entity\EntityRepositoryInterface
   */
  protected $entityRepository;

  /**
   * The entity buffer service.
   *
   * @var \Drupal\graphql\GraphQL\Buffers\EntityBuffer
   */
  protected $entityBuffer;

  /**
   * @var \Drupal\graphql\GraphQL\Buffers\EntityRevisionBuffer
   */
  protected $entityRevisionBuffer;

  /**
   * @var \Drupal\Core\Path\PathValidatorInterface
   */
  protected $pathValidator;

  /**
   * {@inheritdoc}
   *
   * @codeCoverageIgnore
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('entity_type.manager'),
      $container->get('entity.repository'),
      $container->get('graphql.buffer.entity'),
      $container->get('graphql.buffer.entity_revision'),
      $container->get('path.validator')
    );
  }

  /**
   * EntityLoad constructor.
   *
   * @param array $configuration
   *   The plugin configuration array.
   * @param string $pluginId
   *   The plugin id.
   * @param array $pluginDefinition
   *   The plugin definition array.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entity type manager service.
   * @param \Drupal\Core\Entity\EntityRepositoryInterface $entityRepository
   *   The entity repository service.
   * @param \Drupal\graphql\GraphQL\Buffers\EntityBuffer $entityBuffer
   *   The entity buffer service.
   * @param \Drupal\graphql\GraphQL\Buffers\EntityRevisionBuffer $entityRevisionBuffer
   *   The entity revision buffer service.
   *
   * @codeCoverageIgnore
   */
  public function __construct(
    array $configuration,
    $pluginId,
    array $pluginDefinition,
    EntityTypeManagerInterface $entityTypeManager,
    EntityRepositoryInterface $entityRepository,
    EntityBuffer $entityBuffer,
    EntityRevisionBuffer $entityRevisionBuffer,
    PathValidatorInterface $pathValidator
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->entityTypeManager = $entityTypeManager;
    $this->entityRepository = $entityRepository;
    $this->entityBuffer = $entityBuffer;
    $this->entityRevisionBuffer = $entityRevisionBuffer;
    $this->pathValidator = $pathValidator;
  }

  /**
   * Resolver.
   *
   * @param string $type
   * @param string $id
   * @param string|null $revisionId
   * @param string|null $language
   * @param array|null $bundles
   * @param bool|null $access
   * @param \Drupal\Core\Session\AccountInterface|null $accessUser
   * @param string|null $accessOperation
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $context
   *
   * @return \GraphQL\Deferred
   */
  public function resolve(
    string $type,
    string $id,
    ?string $revisionId,
    ?string $language,
    ?array $bundles,
    ?bool $access,
    ?AccountInterface $accessUser,
    ?string $accessOperation,
    FieldContext $context
  ) {
    if ($id[0] === '/') {
      // We are dealing with a path. Attempt to resolve it to an entity.
      $url = $this->pathValidator->getUrlIfValidWithoutAccessCheck($id);
      if (!($url && $url->isRouted() && $url->access())) {
        $context->addCacheTags(['4xx-response']);
        return NULL;
      }

      $parameters = $url->getRouteParameters();
      $id = $parameters[$type];
    }

    if (!preg_match('/^[0-9]+$/', $id)) {
      // Looks like we got a UUID. Transform it to a regular ID.
      $result = $this->entityTypeManager
        ->getStorage($type)
        ->getQuery()
        ->condition('uuid', $id)
        ->accessCheck(FALSE)
        ->execute();
      if ($result) {
        $id = reset($result);
      }
    }

    $resolver = $revisionId
      ? $this->entityRevisionBuffer->add($type, $revisionId)
      : $this->entityBuffer->add($type, $id);

    return new Deferred(function () use ($type, $revisionId, $language, $bundles, $resolver, $context, $access, $accessUser, $accessOperation) {
      /** @var \Drupal\Core\Entity\EntityInterface $entity */
      if (!$entity = $resolver()) {
        // If there is no entity with this id, add the list cache tags so that
        // the cache entry is purged whenever a new entity of this type is
        // saved.
        $type = $this->entityTypeManager->getDefinition($type);
        /** @var \Drupal\Core\Entity\EntityTypeInterface $type */
        $tags = $type->getListCacheTags();
        $context->addCacheTags($tags);
        return NULL;
      }

      $context->addCacheableDependency($entity);
      if (isset($bundles) && !in_array($entity->bundle(), $bundles)) {
        // If the entity is not among the allowed bundles, don't return it.
        return NULL;
      }

      // Get the correct translation.
      if (isset($language) && $language !== $entity->language()->getId() && $entity instanceof TranslatableInterface) {
        if (!$entity->hasTranslation($language)) {
          return NULL;
        }
        $entity = $entity->getTranslation($language);
        $entity->addCacheContexts(["static:language:{$language}"]);
      }

      // Check if the passed user (or current user if none is passed) has access
      // to the entity, if not return NULL.
      if ($access) {
        /** @var \Drupal\Core\Access\AccessResultInterface $accessResult */
        $accessResult = $entity->access($accessOperation, $accessUser, TRUE);
        $context->addCacheableDependency($accessResult);
        if (!$accessResult->isAllowed()) {
          return NULL;
        }
      }

      // Autosave: get autosaved values.
      if (\Drupal::service('module_handler')->moduleExists('silverback_autosave')) {
        $context->mergeCacheMaxAge(0);
        // @todo Add DI to both.
        $service = \Drupal::service('silverback_autosave.entity_form_storage');
        $form_id = "{$entity->getEntityTypeId()}_{$entity->bundle()}_edit_form";
        $autosaved_state = $service->getEntityAndFormState($form_id, $entity->getEntityTypeId(), $entity->id(), $entity->language()->getId(), \Drupal::currentUser()->id());
        /** @var \Drupal\Core\Entity\EntityInterface $autosaved_entity */
        $autosaved_entity = $autosaved_state['entity'] ?? NULL;
        /** @var \Drupal\Core\Form\FormStateInterface $autosaved_form_state */
        $autosaved_form_state = $autosaved_state['form_state'] ?? [];
        if ($autosaved_entity && !empty($autosaved_form_state)) {
          $current_user_input = $autosaved_form_state->getUserInput();
          foreach ($autosaved_entity->getFields() as $name => $field) {
            if (in_array($name, [
              'title',
              'body',
            ]) || str_starts_with($name, 'field_')) {
              if (isset($current_user_input[$name])) {
                $field->setValue($current_user_input[$name]);
              }
            }
          }
          return $autosaved_entity;
        }
      }

      return $entity;
    });
  }

}
