<?php

namespace Drupal\silverback_gatsby;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Reference;

/**
 * Service provider class for the silverback_gatsby module..
 */
class SilverbackGatsbyServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritDoc}
   */
  public function alter(ContainerBuilder $container) {
    // To not introduce a dependency on the locale module, we only decorate the
    // locale.storage service if the service actually exists, so if the locale
    // module is enabled.
    // We also check if the StringContextInterface exists, otherwise most
    // probably the patch from https://www.drupal.org/node/2123543 was not
    // applied.
    if ($container->hasDefinition('locale.storage') && interface_exists('Drupal\locale\StringContextInterface')) {
      $localeDecoratorDefinition = new Definition();
      $localeDecoratorDefinition->setClass(LocaleStorageDecorator::class);
      $localeDecoratorDefinition->setDecoratedService('locale.storage');
      $localeDecoratorDefinition->setPublic(FALSE);
      $localeDecoratorDefinition->addArgument(new Reference('silverback_gatsby.locale.storage.inner'));
      $definitions['silverback_gatsby.locale.storage'] = $localeDecoratorDefinition;
      $container->addDefinitions($definitions);
    }
  }
}
