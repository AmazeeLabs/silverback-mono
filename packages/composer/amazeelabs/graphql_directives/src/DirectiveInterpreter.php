<?php

namespace Drupal\graphql_directives;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
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

class DirectiveInterpreter {

  /**
   * @var \Drupal\graphql\GraphQL\Resolver\ResolverInterface[] $defaultValueMap
   */
  protected array $defaultValueMap;

  /**
   * @var \Drupal\graphql\GraphQL\Resolver\ResolverInterface[][] $fieldResolvers
   */
  protected array $fieldResolvers = [];

  /**
   * @var \Drupal\graphql\GraphQL\Resolver\ResolverInterface[] $typeResolvers
   */
  protected array $typeResolvers = [];

  /**
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface[][]
   */
  public function getFieldResolvers(): array {
    return $this->fieldResolvers;
  }

  /**
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface[]
   */
  public function getTypeResolvers(): array {
    return $this->typeResolvers;
  }

  public function __construct(
    protected DocumentNode           $document,
    protected ResolverBuilder        $builder,
    protected PluginManagerInterface $directiveManager
  ) {
    $this->defaultValueMap = [
      'ID' => $builder->fromValue('#'),
      'String' => $builder->fromValue(''),
      'Int' => $builder->fromValue(0),
      'Float' => $builder->fromValue(0.0),
      'Boolean' => $builder->fromValue(FALSE),
    ];
  }

  protected function addFieldResolver(string $type, string $field, ResolverInterface $resolver) {
    $this->fieldResolvers[$type][$field] = $resolver;
  }

  protected function addTypeResolver(string $type, ResolverInterface $resolver) {
    $this->typeResolvers[$type] = $resolver;
  }

  public function interpret() {
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

  protected function buildDefaultResolver(NodeList $annotations) {
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

  protected function buildTypeResolver(NodeList $annotations) {
    $directives = [];
    foreach ($annotations as $annotation) {
      if ($annotation instanceof DirectiveNode) {
        if ($annotation->name->value === 'default') {
          break;
        }
        if ($this->directiveManager->hasDefinition($annotation->name->value)) {
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

  protected function buildFieldResolver(TypeDefinitionNode $objectType, FieldDefinitionNode $field) {
    /** @var \GraphQL\Language\AST\DirectiveNode[] $directives */
    $directives = array_values(array_filter(iterator_to_array($field->directives->getIterator()), function ($directive) {
      return
        $directive instanceof DirectiveNode &&
        ($directive->name->value === 'map' ||
        $this->directiveManager->hasDefinition($directive->name->value));
    }));

    /** @var array{\GraphQL\Language\AST\DirectiveNode[], \GraphQL\Language\AST\TypeNode, bool}[] $frames */
    $frames = [];
    /** @var array{\GraphQL\Language\AST\DirectiveNode[], \GraphQL\Language\AST\TypeNode, bool}  $currentFrame */
    $currentFrame = [[], $field->type, FALSE];

    $split = [[]];
    for($i = 0; $i < count($directives); $i++) {
      $directive = $directives[$i];
      if ($directive->name->value === 'map') {
        $split[] = [];
      }
      else {
        $split[count($split) - 1][] = $directive;
      }
    }

    while(!($currentFrame[1] instanceof NamedTypeNode)) {
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
   * @param \GraphQL\Language\AST\DirectiveNode[] $directives
   * @param \GraphQL\Language\AST\TypeNode $type
   * @param bool $nonNullable
   *
   * @return \Drupal\graphql\GraphQL\Resolver\ResolverInterface|null
   * @throws \Drupal\graphql_directives\MissingDefaultException
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

  protected function buildDirectiveResolver(DirectiveNode $directive): ResolverInterface {
    $plugin = $this->directiveManager->createInstance($directive->name->value);
    return $plugin->buildResolver($this->builder, $this->buildParameters($directive));
  }

  protected function buildParameters(DirectiveNode $directive): array {
    $config = [];
    if ($directive->arguments) {
      foreach ($directive->arguments as $argument) {
        $config[$argument->name->value] = $this->extractArgument($argument->value);
      }
    }
    return $config;
  }

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
