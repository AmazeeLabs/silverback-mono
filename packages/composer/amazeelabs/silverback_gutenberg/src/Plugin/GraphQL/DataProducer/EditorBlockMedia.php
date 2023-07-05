<?php

namespace Drupal\silverback_gutenberg\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\TranslatableInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Buffers\EntityBuffer;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\layout_builder_fieldblock_test\ContextProvider\FakeViewModeContext;
use Drupal\media\Entity\Media;
use GraphQL\Deferred;
use Symfony\Component\DependencyInjection\ContainerInterface;


/**
 * Resolves a media entity attached to an editor block.
 *
 * @DataProducer(
 *   id = "editor_block_media",
 *   name = @Translation("Editor blockmedia"),
 *   description = @Translation("Resolve the media item attached to an editor block."),
 *   produces = @ContextDefinition("entity:media",
 *     label = @Translation("The media item")
 *   ),
 *   consumes = {
 *     "block" = @ContextDefinition("any",
 *       label = @Translation("A parsed editor block")
 *     )
 *   }
 * )
 */
class EditorBlockMedia extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

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
      $container->get('graphql.buffer.entity')
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
   *
   * @codeCoverageIgnore
   */
  public function __construct(
    array $configuration,
          $pluginId,
    array $pluginDefinition,
    EntityTypeManagerInterface $entityTypeManager,
    EntityRepositoryInterface $entityRepository,
    EntityBuffer $entityBuffer
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->entityTypeManager = $entityTypeManager;
    $this->entityRepository = $entityRepository;
    $this->entityBuffer = $entityBuffer;
  }

  public function resolve($block, FieldContext $context): ?Deferred {
    $id = $block['attrs']['mediaEntityIds'][0] ?? NULL;

    if (!$id) {
      return new Deferred(function () { return NULL; });
    }

    $resolver = $this->entityBuffer->add('media', $id);
    $language = $context->getContextValue('document_language');

    return new Deferred(function () use ($language, $resolver, $context) {
      if (!$entity = $resolver()) {
        // If there is no entity with this id, add the list cache tags so that
        // the cache entry is purged whenever a new entity of this type is
        // saved.
        $type = $this->entityTypeManager->getDefinition('media');
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
      if (
        isset($language) &&
        $language !== $entity->language()->getId() &&
        $entity instanceof TranslatableInterface &&
        $entity->hasTranslation($language)
      ) {
        $entity = $entity->getTranslation($language);
        $entity->addCacheContexts(["static:language:{$language}"]);
      }

      // Check if the passed user (or current user if none is passed) has access
      // to the entity, if not return NULL.
      /** @var \Drupal\Core\Access\AccessResultInterface $accessResult */
      $accessResult = $entity->access(NULL, NULL, TRUE);
      $context->addCacheableDependency($accessResult);
      if ($accessResult->isForbidden()) {
        return NULL;
      }

      return $entity;
    });
  }

}
