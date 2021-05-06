<?php
namespace Drupal\silverback_gatsby_test\Plugin\GraphQL\Schema;
use Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Entity\TranslatableInterface;
use Drupal\Core\Url;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\Schema\ComposableSchema;
use Drupal\node\NodeInterface;

/**
 * @Schema(
 *   id = "silverback_gatsby_test",
 *   name = "Silverback Gatsby Test Schema",
 * )
 */
class SilverbackGatsbyTestSchema extends ComposableSchema {

  public function getResolverRegistry(): ResolverRegistryInterface {
    $builder = new ResolverBuilder();
    $registry = new ResolverRegistry();
    $this->registerResolvers($registry, $builder);
    return $registry;
  }

  /**
   * Retrieves the raw schema definition string.
   *
   * @return string
   *   The schema definition.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   */
  protected function getSchemaDefinition() {
    $id = $this->getPluginId();
    $definition = $this->getPluginDefinition();
    $module = $this->moduleHandler->getModule($definition['provider']);
    $path = 'graphql/' . $id . '.graphqls';
    $file = $module->getPath() . '/' . $path;

    if (!file_exists($file)) {
      throw new InvalidPluginDefinitionException(
        $id,
        sprintf(
          'The module "%s" needs to have a schema definition "%s" in its folder for "%s" to be valid.',
          $module->getName(), $path, $definition['class']));
    }

    return file_get_contents($file) ?: NULL;
  }


  public function registerResolvers(ResolverRegistryInterface $registry, ResolverBuilder $builder) {
    // TODO: Implement registerResolvers() method.
    $addResolver = function(string $path, ResolverInterface $resolver) use ($registry) {
      [$type, $field] = explode('.', $path);
      $registry->addFieldResolver($type, $field, $resolver);
    };

    $registry->addTypeResolver('RootBlock', fn($value) => $value['__type']);
    $registry->addTypeResolver('ContentBlock', fn($value) => $value['__type']);

    $entityLangcode = $builder->callback(
      fn(TranslatableInterface $value) => $value->language()->getId()
    );

    $entityLabel = $builder->callback(fn(EntityInterface $value) => $value->label());

    $fromPath = fn(string $type, string $path, $value = NULL) => $builder->produce('property_path', [
      'path' => $builder->fromValue($path),
      'value' => $value ?: $builder->fromParent(),
      'type' => $builder->fromValue($type),
    ]);

    $entityReferences = fn(string $field) => $builder->defaultValue(
      $builder->produce('entity_reference')
        ->map('entity', $builder->fromParent())
        ->map('field', $builder->fromValue($field)),
      $builder->fromValue([])
    );

    $firstEntityReference = fn(string $field) => $builder->callback(
      fn(FieldableEntityInterface $value) => $value->get($field)->entity
    );

    $imageUrl = $builder->compose(
      $fromPath('entity:media:image', 'field_media_image.0.entity'),
      $builder->produce('image_url')
        ->map('entity', $builder->fromParent())
    );

    $nodePath = $builder->callback(fn(NodeInterface $value) => Url::fromRoute(
      'entity.node.canonical',
      ['node' => $value->id()],
      ['language' => $value->language()]
    )
      ->setAbsolute(FALSE)
      ->toString(TRUE)
      ->getGeneratedUrl()
    );

    $gutenberg = $builder->produce('gutenberg')
      ->map('entity', $builder->fromParent());

    $addResolver('Page.path', $nodePath);
    $addResolver('Page.title', $entityLabel);
    $addResolver('Page.body', $fromPath('entity:node:page', 'field_body.0.processed'));

    $addResolver('GutenbergPage.path', $nodePath);
    $addResolver('GutenbergPage.title', $entityLabel);
    $addResolver('GutenbergPage.body', $gutenberg);

    $addResolver('Article.path', $nodePath);
    $addResolver('Article.title', $entityLabel);
    $addResolver('Article.body', $fromPath('entity:node:article', 'field_body.0.processed'));
    $addResolver('Article.tags', $entityReferences('field_tags'));
    $addResolver('Article.image', $firstEntityReference('field_image'));

    $addResolver('Image.alt', $fromPath('entity:media:image', 'field_media_image.0.alt'));
    $addResolver('Image.url', $imageUrl);

    $addResolver('Tag.title', $entityLabel);
  }

}
