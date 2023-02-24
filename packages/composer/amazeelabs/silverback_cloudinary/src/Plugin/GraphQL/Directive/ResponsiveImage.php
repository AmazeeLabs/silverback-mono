<?php

namespace Drupal\silverback_cloudinary\Plugin\GraphQL\Directive;
use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @Directive(
 *   id="responsiveImage",
 *   description="Directive for the responsive_image data producer.",
 *   arguments = {
 *     "width" = "Int",
 *     "height" = "Int",
 *     "sizes" = "[[Int!]!]",
 *     "transform" = "String",
 *   }
 * )
 */
class ResponsiveImage extends PluginBase implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->produce('responsive_image')
      ->map('image', $builder->fromParent())
      ->map('width', $builder->fromArgument('width'))
      ->map('height', $builder->fromArgument('height'))
      ->map('sizes', $builder->fromArgument('sizes'))
      ->map('transform', $builder->fromArgument('transform'));
  }
}
