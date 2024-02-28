<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\Directive;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @deprecated
 *
 * Duplicates a part of SilverbackGatsbySchemaExtension::addFieldResolvers().
 *
 * @Directive(
 *   id = "silverbackGatsbyEntityId"
 * )
 */
class SilverbackGatsbyEntityId implements  DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, $arguments): ResolverInterface {
    return $builder->callback(function(EntityInterface $entity) {
      if ($entity instanceof ContentEntityInterface) {
        $isTranslatable = FALSE;
        if (\Drupal::hasService('content_translation.manager')) {
          /** @var \Drupal\content_translation\ContentTranslationManagerInterface $ctm */
          $ctm = \Drupal::service('content_translation.manager');
          $isTranslatable = $ctm->isEnabled($entity->getEntityTypeId(), $entity->bundle());
        }
        return $isTranslatable
          ? $entity->uuid() . ':' . $entity->language()->getId()
          : $entity->uuid();
      }
      return $entity->id();
    });
  }

}
