<?php

namespace Drupal\graphql_directives;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\GraphQL\Resolvers\Hashmap;
use Drupal\graphql_directives\Plugin\GraphQL\Directive\ArgumentTrait;
use GraphQL\Language\AST\ArgumentNode;
use GraphQL\Language\AST\DirectiveNode;
use GraphQL\Language\AST\DocumentNode;
use GraphQL\Language\AST\EnumTypeDefinitionNode;
use GraphQL\Language\AST\FieldDefinitionNode;
use GraphQL\Language\AST\InterfaceTypeDefinitionNode;
use GraphQL\Language\AST\ListTypeNode;
use GraphQL\Language\AST\ListValueNode;
use GraphQL\Language\AST\NamedTypeNode;
use GraphQL\Language\AST\NameNode;
use GraphQL\Language\AST\NodeList;
use GraphQL\Language\AST\NonNullTypeNode;
use GraphQL\Language\AST\NullValueNode;
use GraphQL\Language\AST\ObjectFieldNode;
use GraphQL\Language\AST\ObjectTypeDefinitionNode;
use GraphQL\Language\AST\ObjectValueNode;
use GraphQL\Language\AST\ScalarTypeDefinitionNode;
use GraphQL\Language\AST\StringValueNode;
use GraphQL\Language\AST\TypeDefinitionNode;
use GraphQL\Language\AST\TypeNode;
use GraphQL\Language\AST\UnionTypeDefinitionNode;
use GraphQL\Language\AST\ValueNode;

/**
 * Parse graphql schemas to extract directive annotations and build resolvers.
 */
class DirectiveInterpreter {
  use ArgumentTrait;

  /**
   * Default value definitions for each possible type.
   *
   * @var \Drupal\graphql\GraphQL\Resolver\ResolverInterface[]
   */
  protected array $defaultValueMap;

  /**
   * All collected field resolvers.
   *
   * @var \Drupal\graphql\GraphQL\Resolver\ResolverInterface[][]
   */
  protected array $fieldResolvers = [];

  /**
   * All collected type resolvers.
   *
   * @var \Drupal\graphql\GraphQL\Resolver\ResolverInterface[]
   */
  protected array $typeResolvers = [];

  /**
   * Retrieve field resolvers.
   *
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface[][]
   *   Nested map of resolvers, keyed by type name and field name.
   */
  public function getFieldResolvers(): array {
    return $this->fieldResolvers;
  }

  /**
   * Retrieve type resolvers.
   *
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface[]
   *   Map of resolvers, keyed by type name.
   */
  public function getTypeResolvers(): array {
    return $this->typeResolvers;
  }

  /**
   * Constructor.
   *
   * @param array<string,mixed> $autoloadDirectives
   *   Dictionary of directives to autoload. Keys are directive names,
   *   values are triples of (service, class, method).
   */
  public function __construct(
    protected DocumentNode $document,
    protected ResolverBuilder $builder,
    protected PluginManagerInterface $directiveManager,
    protected array $autoloadDirectives = [],
  ) {
    $this->defaultValueMap = [
      'ID' => $builder->fromValue('#'),
      'String' => $builder->fromValue(''),
      'Int' => $builder->fromValue(0),
      'Float' => $builder->fromValue(0.0),
      'Boolean' => $builder->fromValue(FALSE),
    ];
  }

  /**
   * Add a field resolver.
   */
  protected function addFieldResolver(string $type, string $field, ResolverInterface $resolver): void {
    $this->fieldResolvers[$type][$field] = $resolver;
  }

  /**
   * Add a type resolver.
   */
  protected function addTypeResolver(string $type, ResolverInterface $resolver): void {
    $this->typeResolvers[$type] = $resolver;
  }

  /**
   * Interpret the document and build resolvers.
   */
  public function interpret() :void {
    // First pass, collect all type and default resolvers.
    foreach ($this->document->definitions as $definition) {
      if ($definition instanceof ObjectTypeDefinitionNode || $definition instanceof EnumTypeDefinitionNode) {
        if ($resolver = $this->buildDefaultResolver($definition->directives)) {
          $this->defaultValueMap[$definition->name->value] = $resolver;
        }
      }
      if ($definition instanceof InterfaceTypeDefinitionNode || $definition instanceof UnionTypeDefinitionNode) {
        $this->defaultValueMap[$definition->name->value] = $this->buildDefaultResolver($definition->directives);
        if ($resolver = $this->buildTypeResolver($definition->directives)) {
          $this->addTypeResolver($definition->name->value, $resolver);
        }
      }
      if ($definition instanceof ScalarTypeDefinitionNode) {
        $this->defaultValueMap[$definition->name->value] = $this->buildDefaultResolver($definition->directives);
      }
    }

    // Then, create directive-based resolvers for all annotated fields.
    foreach ($this->document->definitions as $definition) {
      if ($definition instanceof ObjectTypeDefinitionNode) {
        foreach ($definition->fields as $field) {
          if ($field instanceof FieldDefinitionNode) {
            if ($resolver = $this->buildFieldResolver($definition, $field)) {
              $this->addFieldResolver($definition->name->value, $field->name->value, $resolver);
            }
          }
        }
      }
    }
  }

  /**
   * Determine the default resolver for given list of annotations.
   *
   * @param \GraphQL\Language\AST\NodeList<Node> $annotations
   *   The list of annotations to parse.
   */
  protected function buildDefaultResolver(NodeList $annotations) : ?ResolverInterface {
    $directives = [];
    $default = FALSE;
    foreach ($annotations as $annotation) {
      if ($annotation instanceof DirectiveNode) {
        if ($annotation->name->value === 'default') {
          $default = TRUE;
        }
        if ($default && $this->directiveManager->hasDefinition($annotation->name->value)) {
          $directives[] = $annotation;
        }
      }
    }

    if (count($directives) === 0) {
      return NULL;
    }

    return (count($directives) === 1 && $directive = reset($directives))
      ? $this->buildDirectiveResolver($directive)
      : $this->builder->compose(...array_map([
        $this,
        'buildDirectiveResolver',
      ], $directives));
  }

  /**
   * Verify if a directive is implemented.
   */
  protected function directiveExists(string $name): bool {
    return $this->directiveManager->hasDefinition($name) || array_key_exists($name, $this->autoloadDirectives);
  }

  /**
   * Build a type resolver.
   *
   * @param \GraphQL\Language\AST\NodeList<Node> $annotations
   *   The list of annotations to parse.
   */
  protected function buildTypeResolver(NodeList $annotations) : ?ResolverInterface {
    $directives = [];
    foreach ($annotations as $annotation) {
      if ($annotation instanceof DirectiveNode) {
        if ($annotation->name->value === 'default') {
          break;
        }
        if ($this->directiveExists($annotation->name->value)) {
          $directives[] = $annotation;
        }
      }
    }

    if (count($directives) === 0) {
      return NULL;
    }

    return (count($directives) === 1 && $directive = reset($directives))
      ? $this->buildDirectiveResolver($directive)
      : $this->builder->compose(...array_map([
        $this,
        'buildDirectiveResolver',
      ], $directives));
  }

  /**
   * Build the resolver for one specific field.
   */
  protected function buildFieldResolver(TypeDefinitionNode $objectType, FieldDefinitionNode $field) : ?ResolverInterface {
    /** @var \GraphQL\Language\AST\DirectiveNode[] $directives */
    $directives = array_values(array_filter(iterator_to_array($field->directives->getIterator()), function ($directive) {
      return $directive instanceof DirectiveNode &&
        ($directive->name->value === 'map' ||
        $this->directiveExists($directive->name->value));
    }));

    /** @var array{\GraphQL\Language\AST\DirectiveNode[], \GraphQL\Language\AST\TypeNode, bool}[] $frames */
    $frames = [];
    /** @var array{\GraphQL\Language\AST\DirectiveNode[], \GraphQL\Language\AST\TypeNode, bool}  $currentFrame */
    $currentFrame = [[], $field->type, FALSE];

    $split = [[]];
    for ($i = 0; $i < count($directives); $i++) {
      $directive = $directives[$i];
      if ($directive->name->value === 'map') {
        $split[] = [];
      }
      else {
        $split[count($split) - 1][] = $directive;
      }
    }

    while (!($currentFrame[1] instanceof NamedTypeNode)) {
      if ($currentFrame[1] instanceof NonNullTypeNode) {
        $currentFrame[2] = TRUE;
        $currentFrame[1] = $currentFrame[1]->type;
      }
      if ($currentFrame[1] instanceof ListTypeNode) {
        $currentFrame[0] = array_shift($split) ?? [];
        $frames[] = $currentFrame;
        $currentFrame = [[], $currentFrame[1]->type, FALSE];
      }
    }

    if (count($split) > 1) {
      throw new MapNestingException($objectType->name->value, $field->name->value);
    }

    $frames[] = [array_shift($split) ?? [], $currentFrame[1], $currentFrame[2]];
    // If the first frame has no directive, we inject a magic @prop directive.
    if (count($frames[0][0]) === 0) {
      $frames[0][0] = [
        new DirectiveNode([
          'name' => new NameNode(['value' => 'prop']),
          'arguments' => new NodeList(
            [
              new ArgumentNode([
                'name' => new NameNode(['value' => 'key']),
                'value' => new StringValueNode(['value' => $field->name->value]),
              ]),
            ]
          ),
        ]),
      ];
    }

    return count($frames) === 1
      ? $this->buildFrameResolver($frames[0][0], $frames[0][1], $frames[0][2])
      : $this->builder->compose(...array_map(function ($frame, $index) {
        return $index === 0
          ? $this->buildFrameResolver($frame[0], $frame[1], $frame[2])
          : $this->builder->map($this->buildFrameResolver($frame[0], $frame[1], $frame[2]));
      }, $frames, array_keys($frames)));

  }

  /**
   * Build the resolver for a specific frame in the execution stack.
   *
   * @param array<int,mixed> $directives
   *   The list of directives to apply.
   * @param \GraphQL\Language\AST\TypeNode $type
   *   The type definition node.
   * @param bool $nonNullable
   *   Indicates if this field is nullable or not.
   */
  protected function buildFrameResolver(array $directives, TypeNode $type, bool $nonNullable): ?ResolverInterface {
    if (count($directives) === 0) {
      $resolver = $this->builder->fromParent();
    }
    else {
      $resolver = (count($directives) === 1 && $directive = reset($directives))
        ? $this->buildDirectiveResolver($directive)
        : $this->builder->compose(...array_map([
          $this,
          'buildDirectiveResolver',
        ], $directives));
    }

    return $nonNullable
      ? $this->builder->defaultValue($resolver, $this->buildDefaultValue($type))
      : $resolver;
  }

  /**
   * Build the default value resolver, apllied if the type is mandatory.
   */
  protected function buildDefaultValue(TypeNode $type): ResolverInterface {
    if ($type instanceof NonNullTypeNode) {
      return $this->buildDefaultValue($type->type);
    }
    if ($type instanceof ListTypeNode) {
      return $this->builder->fromValue([]);
    }
    /** @var \GraphQL\Language\AST\NamedTypeNode $type */
    if (!isset($this->defaultValueMap[$type->name->value])) {
      throw new MissingDefaultException($type->name->value);
    }
    return $this->defaultValueMap[$type->name->value];
  }

  /**
   * Build the resolver for a specific directive.
   */
  protected function buildDirectiveResolver(DirectiveNode $directive): ResolverInterface {
    if (array_key_exists($directive->name->value, $this->autoloadDirectives)) {
      $config = $this->autoloadDirectives[$directive->name->value];
      $args = [];
      $params = $this->buildParameters($directive);
      foreach ($params as $key => $value) {
        $args[$key] = $this->argumentResolver($value, $this->builder);
      }
      return $this->builder->produce('autoload')
        ->map('service', $this->builder->fromValue(array_key_exists('service', $config) ? $config['service'] : NULL))
        ->map('class', $this->builder->fromValue(array_key_exists('class', $config) ? $config['class'] : NULL))
        ->map('method', $this->builder->fromValue($config['method']))
        ->map('parent', $this->builder->fromParent())
        ->map('args', new Hashmap($args));
    }
    $plugin = $this->directiveManager->createInstance($directive->name->value);
    return $plugin->buildResolver($this->builder, $this->buildParameters($directive));
  }

  /**
   * Build the parameter set for a directive.
   *
   * @return array<string,mixed>
   *   Dictionary of arguments.
   */
  protected function buildParameters(DirectiveNode $directive): array {
    $config = [];
    if ($directive->arguments) {
      foreach ($directive->arguments as $argument) {
        $config[$argument->name->value] = $this->extractArgument($argument->value);
      }
    }
    return $config;
  }

  /**
   * Recursively extract an argument value.
   */
  protected function extractArgument(ValueNode $value): mixed {
    if ($value instanceof NullValueNode) {
      return NULL;
    }
    else {
      if ($value instanceof ListValueNode) {
        return array_map([
          $this,
          'extractArgument',
        ], iterator_to_array($value->values->getIterator()));
      }
      else {
        if ($value instanceof ObjectValueNode) {
          return array_reduce(array_map(function (ObjectFieldNode $field) {
            return [$field->name->value => $this->extractArgument($field->value)];
          }, iterator_to_array($value->fields->getIterator())), 'array_merge', []);
        }
        else {
          return $value->value;
        }
      }
    }
  }

}
