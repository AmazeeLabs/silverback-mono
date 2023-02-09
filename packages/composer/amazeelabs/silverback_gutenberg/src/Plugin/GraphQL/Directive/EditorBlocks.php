<?php

namespace Drupal\silverback_gutenberg\Plugin\GraphQL\Directive;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @Directive(
 *   id = "resolveEditorBlocks",
 *   description = "Parse a gutenberg document into block data.",
 *   arguments = {
 *     "path" = "String!",
 *     "ignored" = "[String!]",
 *     "aggregated" = "[String!]"
 *   }
 * )
 */
class EditorBlocks extends PluginBase implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->produce('editor_blocks', [
      'path' => $builder->fromValue($arguments['path']),
      'entity' => $builder->fromParent(),
      'type' => $builder->callback(
        fn(EntityInterface $entity) => $entity->getTypedData()->getDataDefinition()->getDataType()
      ),
      'ignored' => $builder->fromValue($arguments['ignored'] ?? []),
      'aggregated' => $builder->fromValue($arguments['aggregated'] ?? ['core/paragraph'])
    ]);
  }

}
