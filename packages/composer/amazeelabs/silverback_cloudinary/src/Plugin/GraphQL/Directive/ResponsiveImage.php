<?php

namespace Drupal\silverback_cloudinary\Plugin\GraphQL\Directive;
use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql_directives\Plugin\GraphQL\Directive\ArgumentTrait;

/**
 * @Directive(
 *   id="responsiveImage",
 *   description="Directive for the responsive_image data producer.",
 *   arguments = {
 *     "width" = "String",
 *     "height" = "String",
 *     "sizes" = "String",
 *     "transform" = "String",
 *   }
 * )
 */
class ResponsiveImage extends PluginBase implements DirectiveInterface {
  use ArgumentTrait;

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->produce('responsive_image')
      ->map('image', $builder->fromParent())
      ->map('width', $this->argumentResolver($arguments['width'], $builder))
      ->map('height', $this->argumentResolver($arguments['height'], $builder))
      ->map('sizes', $this->argumentResolver($arguments['sizes'], $builder))
      ->map('transform', $this->argumentResolver($arguments['transform'], $builder));
  }
}
