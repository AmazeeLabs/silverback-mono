<?php

namespace Drupal\silverback_gutenberg;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;
use Drupal\silverback_gutenberg\Normalizer\GutenbergContentEntityNormalizer;
use Drupal\silverback_gutenberg\Service\MediaService;

class SilverbackGutenbergServiceProvider extends ServiceProviderBase {
  public function alter(ContainerBuilder $container) {
    if ($container->has('gutenberg.media_service')) {
      $definition = $container->getDefinition('gutenberg.media_service');
      $definition->setClass(MediaService::class);
    }
    if ($container->has('webform.message_manager')) {
      $definition = $container->getDefinition('webform.message_manager');
      $definition->setClass(WebformMessageManager::class);
    }

    if ($container->has('default_content.content_entity_normalizer')) {
      $definition = $container->getDefinition('default_content.content_entity_normalizer');
      $definition->setClass(GutenbergContentEntityNormalizer::class);
    }
  }
}
