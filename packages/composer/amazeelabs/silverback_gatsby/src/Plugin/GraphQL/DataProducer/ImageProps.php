<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Render\RenderContext;
use Drupal\Core\Render\RendererInterface;
use Drupal\file\FileInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\image\Entity\ImageStyle;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Returns an image style derivative of an image.
 *
 * @DataProducer(
 *   id = "image_props",
 *   name = @Translation("Image properties"),
 *   description = @Translation("Returns an image's properties."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Image properties")
 *   ),
 *   consumes = {
 *     "entity" = @ContextDefinition("entity",
 *       label = @Translation("Entity"),
 *       required = FALSE
 *     )
 *   }
 * )
 */
class ImageProps extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The rendering service.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * The file URL generator service.
   *
   * @var \Drupal\Core\File\FileUrlGeneratorInterface
   */
  protected $fileUrlGenerator;

  /**
   * {@inheritdoc}
   *
   * @codeCoverageIgnore
   */
  public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
    return new static(
      $configuration,
      $pluginId,
      $pluginDefinition,
      $container->get('renderer'),
      $container->get('file_url_generator')
    );
  }

  /**
   * ImageProps constructor.
   *
   * @param array $configuration
   *   The plugin configuration array.
   * @param string $pluginId
   *   The plugin id.
   * @param mixed $pluginDefinition
   *   The plugin definition.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer service.
   * @param \Drupal\Core\File\FileUrlGeneratorInterface $fileGenerator
   *   The file generator service.
   *
   * @codeCoverageIgnore
   */
  public function __construct(
    array $configuration,
    $pluginId,
    $pluginDefinition,
    RendererInterface $renderer,
    FileUrlGeneratorInterface $fileGenerator
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->renderer = $renderer;
    $this->fileUrlGenerator = $fileGenerator;
  }

  /**
   * Resolver.
   *
   * @param \Drupal\file\FileInterface $entity
   * @param \Drupal\Core\Cache\RefinableCacheableDependencyInterface $metadata
   *
   * @return array|null
   */
  public function resolve(FileInterface $entity = NULL, RefinableCacheableDependencyInterface $metadata) {
    // Return if we dont have an entity.
    if (!$entity) {
      return NULL;
    }

    $access = $entity->access('view', NULL, TRUE);
    $metadata->addCacheableDependency($access);
    if ($access->isAllowed()) {

      $width = $entity->width;
      $height = $entity->height;

      // @todo Not sure why PHPStan complains here, this should be refactored to
      // check the entity properties first.
      // @phpstan-ignore-next-line
      if (empty($width) || empty($height)) {
        /** @var \Drupal\Core\Image\ImageInterface $image */
        $image = \Drupal::service('image.factory')->get($entity->getFileUri());
        if ($image->isValid()) {
          $width = $image->getWidth();
          $height = $image->getHeight();
        }
      }


      // The underlying URL generator that will be invoked will leak cache
      // metadata, resulting in an exception. By wrapping within a new render
      // context, we can capture the leaked metadata and make sure it gets
      // incorporated into the response.
      $context = new RenderContext();
      $url = $this->renderer->executeInRenderContext($context, function () use ($entity) {
        return $this->fileUrlGenerator->generateAbsoluteString($entity->getFileUri());
      });

      if (!$context->isEmpty()) {
        $metadata->addCacheableDependency($context->pop());
      }

      return [
        'src' => $url,
        'width' => $width,
        'height' => $height,
      ];
    }

    return NULL;
  }

}
