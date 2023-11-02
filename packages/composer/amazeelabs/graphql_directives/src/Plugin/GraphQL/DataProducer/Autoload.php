<?php

namespace Drupal\graphql_directives\Plugin\GraphQL\DataProducer;

use Drupal\Component\DependencyInjection\ContainerInterface as DrupalContainerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\graphql_directives\DirectiveArguments;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Data producer plugin that dynamically loads a resolver.
 *
 * Executes a resolver that is either  a static method or a method on a service.
 *
 * @todo Ideally this should not require a plugin, but be implmented into a custom
 *       resolver registry that supports this directly.
 *
 * @DataProducer(
 *   id = "autoload",
 *   name = @Translation("Autoload"),
 *   description = @Translation("Dynamically execute a static or service method."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Value")
 *   ),
 *   consumes = {
 *     "service" = @ContextDefinition("string",
 *       label = @Translation("Service name"),
 *       required = FALSE
 *     ),
 *     "class" = @ContextDefinition("string",
 *       label = @Translation("Class name"),
 *       required = FALSE
 *     ),
 *     "method" = @ContextDefinition("string",
 *       label = @Translation("Method name"),
 *       required = TRUE
 *     ),
 *     "parent" = @ContextDefinition("any",
 *       label = @Translation("The current parent value"),
 *       required = FALSE
 *     ),
 *     "args" = @ContextDefinition("any",
 *       label = @Translation("Additional input arguments"),
 *       required = TRUE
 *     )
 *   }
 * )
 */
class Autoload extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The symfony service container.
   *
   * Use to dynamically load services.
   *
   * @var \Drupal\Component\DependencyInjection\ContainerInterface
   */

  protected DrupalContainerInterface $container;

  /**
   * {@inheritdoc}
   */
  public function __construct(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->container = $container;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): Autoload {
    return new static($container, $configuration, $plugin_id, $plugin_definition);
  }

  /**
   * Execute and autoloaded resolver.
   *
   * @param string|null $service
   *   The symfony service id.
   * @param string|null $class
   *   The class name.
   * @param string $method
   *   The method name.
   * @param mixed $parent
   *   The current parent value.
   * @param array<string,mixed> $args
   *   Arguments that are passed into the resolver.
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $field
   *   The current field context.
   */
  public function resolve($service, $class, $method, $parent, $args, FieldContext $field) : mixed {
    if ($service) {
      return $this->container->get($service)->$method(new DirectiveArguments($parent, $args, $field));
    }
    if ($class) {
      if (!class_exists($class)) {
        throw new \Exception("Class $class does not exist.");
      }
      return $class::$method(new DirectiveArguments($parent, $args, $field));
    }
  }

}
