<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @Directive(
 *   id = "focalPoint",
 *   description = "Retrieve focal point coordinates for an image source.",
 *   arguments = {}
 * )
 */
class FocalPoint extends PluginBase implements DirectiveInterface {

    /**
     * {@inheritDoc}
     * @throws \Exception
     */
    public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
        return $builder->produce('focal_point')->map('image_props', $builder->fromParent());
    }

}
