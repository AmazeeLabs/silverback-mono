<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\Directive;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;

/**
 * @Directive(
 *   id = "resolveProperty",
 *   description = "Pull a specific typed-data property from an entity.",
 *   arguments = {
 *     "path" = "String!"
 *   }
 * )
 */
class EntityProperty extends PluginBase implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->produce('property_path', [
      'path' => $builder->fromValue($arguments['path']),
      'value' => $builder->fromParent(),
      'type' => $builder->callback(
        fn(EntityInterface $entity) => $entity->getTypedData()->getDataDefinition()->getDataType()
      ),
    ]);
  }

}
