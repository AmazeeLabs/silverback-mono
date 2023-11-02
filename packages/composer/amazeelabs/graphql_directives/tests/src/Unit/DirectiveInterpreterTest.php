<?php

namespace Drupal\Tests\graphql_directives\Unit;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql_directives\DirectiveInterpreter;
use Drupal\graphql_directives\GraphQL\Resolvers\Hashmap;
use Drupal\graphql_directives\MapNestingException;
use Drupal\graphql_directives\MissingDefaultException;
use Drupal\graphql_directives\Plugin\GraphQL\Directive\Prop;
use Drupal\Tests\UnitTestCase;
use GraphQL\Language\Parser;

/**
 * The actual test case for directice interpreters.
 */
class DirectiveInterpreterTest extends UnitTestCase {

  /**
   * Mocked resolver builder.
   */
  protected ResolverBuilder $builder;

  /**
   * Mocked directives manager.
   */
  protected PluginManagerInterface $directiveManager;

  /**
   * Create a test resolver.
   *
   * @param mixed $value
   *   The resolvers input value.
   * @param array $args
   *   The resolvers input arguments.
   */
  public static function createResolver($value, $args = []) : mixed {
    return new class($value, $args) implements ResolverInterface {

      /**
       * Constructor.
       *
       * Initialises public properties used to test for correct construction.
       *
       * @param mixed $value
       *   The resolvers input value.
       * @param array $args
       *   Resolver arguments.
       */
      public function __construct(public $value, public $args) {
      }

      /**
       * Empty resolver, to satisfy the interface.
       *
       * Tests only check for the class instance.
       */
      public function resolve($value, $args, $context, $info, $field) : void {
      }

      /**
       * Implementation of DataProducerProxy::map().
       *
       * Used for testing correct mapping of arguments.
       */
      public function map($key, ResolverInterface $value) {
        $this->args[$key] = $value;
        return $this;
      }

    };
  }

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->autoloads = [];
    $this->directiveManager = $this->createMock(PluginManagerInterface::class);

    // The directive manager only knows about directives from @a to @z.
    $this->directiveManager->method('hasDefinition')
      ->willReturnCallback(fn($id) => $id === 'prop' || preg_match('/^[a-z]$/', $id));
    // And returns a TestDirective with that requested id as value.
    $this->directiveManager->method('createInstance')
      ->willReturnCallback(fn($id) => $id === 'prop' ? new Prop([], 'prop', []) : new class($id) implements DirectiveInterface {

        /**
         * @param string $id
         *   The directive id. Used for testing if the correct
         *   resolver is created.
         */
        public function __construct(public $id) {
        }

        /**
         * {@inheritdoc}
         */
        public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
          $resolver = DirectiveInterpreterTest::createResolver([
            'produce', $this->id,
          ]);
          foreach ($arguments as $key => $value) {
            $resolver->map($key, $builder->fromValue($value));
          }
          return $resolver;
        }

      });

    $this->builder = $this->createMock(ResolverBuilder::class);
    $this->builder->method('produce')
      ->willReturnCallback(fn($id) => static::createResolver(['produce', $id]));
    $this->builder->method('fromValue')
      ->willReturnCallback(fn($value) => static::createResolver([
        'value', $value,
      ]));
    $this->builder->method('fromParent')
      ->willReturnCallback(fn() => static::createResolver(['parent']));
    $this->builder->method('fromContext')
      ->willReturnCallback(fn($name) => static::createResolver([
        'context', $name,
      ]));
    $this->builder->method('fromArgument')
      ->willReturnCallback(fn($name) => static::createResolver([
        'argument',
        $name,
      ]));
    $this->builder->method('compose')
      ->willReturnCallback(fn(...$resolvers) => static::createResolver([
        'compose',
        ...$resolvers,
      ]));
    $this->builder->method('defaultValue')
      ->willReturnCallback(fn(...$resolvers) => static::createResolver([
        'default',
        ...$resolvers,
      ]));

    $this->builder->method('map')
      ->willReturnCallback(fn(...$resolvers) => static::createResolver([
        'map',
        ...$resolvers,
      ]));
  }

  protected $autoloads = [];

  /**
   * Fill the autoloader for the test.
   *
   * @param array $autoloads
   *   A map of autoload directives.
   */
  protected function setAutoloaded(array $autoloads) : void {
    $this->autoloads = $autoloads;
  }

  /**
   * Assert a given schema definition produces the expected resolver mapping.
   *
   * @param string $schema
   *   The schema definition to interpret.
   * @param array $expected
   *   The expected resolver mapping.
   */
  protected function assertResolvers(string $schema, array $expected) : void {
    $parsed = Parser::parse($schema);
    $interpreter = new DirectiveInterpreter($parsed, $this->builder, $this->directiveManager, $this->autoloads);
    $interpreter->interpret();
    $this->assertEquals($expected, array_merge(
      $interpreter->getTypeResolvers(),
      $interpreter->getFieldResolvers(),
    ));
  }

  /**
   * Interpretation of no directives should not fail.
   */
  public function testNoDirectives() : void {
    $this->assertResolvers('type Query { a: String }', [
      'Query' => [
        'a' => $this->builder->produce('prop')
          ->map('input', $this->builder->fromParent())
          ->map('property', $this->builder->fromValue('a')),
      ],
    ]);
  }

  /**
   * Unknown directives should be ignored.
   */
  public function testNoKnownDirectives() : void {
    $this->assertResolvers('type Query { a: String @unknown }', [
      'Query' => [
        'a' => $this->builder->produce('prop')
          ->map('input', $this->builder->fromParent())
          ->map('property', $this->builder->fromValue('a')),
      ],
    ]);
  }

  /**
   * A simple directive should map to its resolver.
   */
  public function testSingleDirective() : void {
    $this->assertResolvers('type Query { a: String @a }', [
      'Query' => [
        'a' => $this->builder->produce('a'),
      ],
    ]);
  }

  /**
   * Multiple directives are combined into a composition.
   */
  public function testChainedDirectives() : void {
    $this->assertResolvers('type Query { a: String @a @b }', [
      'Query' => [
        'a' => $this->builder->compose(
          $this->builder->produce('a'),
          $this->builder->produce('b'),
        ),
      ],
    ]);
  }

  /**
   * Directives can be passed null arguments.
   */
  public function testNullArgument() : void {
    $this->assertResolvers('type Query { a: String @a(b: null) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(NULL)),
      ],
    ]);
  }

  /**
   * Directives can be passed integer argument.
   */
  public function testIntArgument() : void {
    $this->assertResolvers('type Query { a: String @a(b: 0, c: -1) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(0))
          ->map('c', $this->builder->fromValue(-1)),
      ],
    ]);
  }

  /**
   * Directives can be passed float argument.
   */
  public function testFloatArgument() : void {
    $this->assertResolvers('type Query { a: String @a(b: 1.34) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(1.34)),
      ],
    ]);
  }

  /**
   * Directives can be passed string arguments.
   */
  public function testStringArgument() : void {
    $this->assertResolvers('type Query { a: String @a(b: "c") }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue('c')),
      ],
    ]);
  }

  /**
   * Directives can be passed enum arguments.
   */
  public function testEnumArgument() : void {
    $this->assertResolvers('type Query { a: String @a(b: C) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue('C')),
      ],
    ]);
  }

  /**
   * Directives can be passed object arguments.
   */
  public function testObjectArgument() : void {
    $this->assertResolvers('type Query { a: String @a(b: {c: "d"}) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(['c' => 'd'])),
      ],
    ]);
  }

  /**
   * Directives can be passed list arguments.
   */
  public function testListArgument() :void {
    $this->assertResolvers('type Query { a: String @a(b: ["c", "d"]) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(['c', 'd'])),
      ],
    ]);
  }

  /**
   * Directives can be passed nested list arguments.
   */
  public function testNestedListArgument() : void {
    $this->assertResolvers('type Query { a: String @a(b: ["c", ["d"]]) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(['c', ['d']])),
      ],
    ]);
  }

  /**
   * Directives can handle complex argument combinations.
   */
  public function testComplexArgument() : void {
    $this->assertResolvers('type Query { a: String @a(b: {c: ["d", "e"]}) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(['c' => ['d', 'e']])),
      ],
    ]);
  }

  /**
   * Optional types don't need a default value.
   */
  public function testOptional() : void {
    $this->assertResolvers('type Query { a: String @a }', [
      'Query' => [
        'a' => $this->builder->produce('a'),
      ],
    ]);
  }

  /**
   * Boolean values produce "FALSE" by default.
   */
  public function testDefaultBoolean() : void {
    $this->assertResolvers('type Query { a: Boolean! @a }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('a'),
          $this->builder->fromValue(FALSE),
        ),
      ],
    ]);
  }

  /**
   * ID values produce "#" by default.
   */
  public function testDefaultId() : void {
    $this->assertResolvers('type Query { a: ID! @a }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('a'),
          $this->builder->fromValue('#'),
        ),
      ],
    ]);
  }

  /**
   * String values produce "" by default.
   */
  public function testDefaultString() :void {
    $this->assertResolvers('type Query { a: String! @a }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('a'),
          $this->builder->fromValue(''),
        ),
      ],
    ]);
  }

  /**
   * Int values produce 0 by default.
   */
  public function testDefaultInt(): void {
    $this->assertResolvers('type Query { a: Int! @a }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('a'),
          $this->builder->fromValue(0),
        ),
      ],
    ]);
  }

  /**
   * Float values produce 0.0 by default.
   */
  public function testDefaultFloat(): void {
    $this->assertResolvers('type Query { a: Float! @a }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('a'),
          $this->builder->fromValue(0.0),
        ),
      ],
    ]);
  }

  /**
   * List values produce [] by default.
   */
  public function testDefaultList(): void {
    $this->assertResolvers('type Query { a: [Int]! @a }', [
      'Query' => [
        'a' => $this->builder->compose(
          $this->builder->defaultValue(
          $this->builder->produce('a'),
          $this->builder->fromValue([]),
          ),
          $this->builder->map($this->builder->fromParent()),
        ),
      ],
    ]);
  }

  /**
   * Multiple default values are applied correctly.
   */
  public function testMultiDefault() : void {
    $this->assertResolvers('type Query { a: String! @a @b }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->compose(
            $this->builder->produce('a'),
            $this->builder->produce('b'),
          ),
          $this->builder->fromValue(''),
        ),
      ],
    ]);
  }

  /**
   * Object types without a default definition throw an exception.
   */
  public function testUnknownType() : void {
    $this->expectException(MissingDefaultException::class);
    $this->assertResolvers('type Query { a: Unknown! @a }', []);
  }

  /**
   * Scalar types can be annotated with a default value.
   */
  public function testDefaultScalarType() : void {
    $this->assertResolvers('scalar Email @default @c type Query { a: Email! @b }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('b'),
          $this->builder->produce('c'),
        ),
      ],
    ]);
  }

  /**
   * Object types can be annotated with a default value.
   */
  public function testDefaultObjectType() : void {
    $this->assertResolvers('type Object @default @c { a: String @a } type Query { a: Object! @b }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('b'),
          $this->builder->produce('c'),
        ),
      ],
      'Object' => [
        'a' => $this->builder->produce('a'),
      ],
    ]);
  }

  /**
   * Interface types can be annotated with a default value.
   */
  public function testDefaultInterfaceType() : void {
    $this->assertResolvers('interface Animal @b @default @c { a: String! @a } type Query { a: Animal! @b }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('b'),
          $this->builder->produce('c'),
        ),
      ],
      'Animal' => $this->builder->produce('b'),
    ]);
  }

  /**
   * Union types can be annotated with a default value.
   */
  public function testDefaultUnionType() : void {
    $this->assertResolvers('union Animal @b @default @c = Cat | Dog type Query { a: Animal! @b }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('b'),
          $this->builder->produce('c'),
        ),
      ],
      'Animal' => $this->builder->produce('b'),
    ]);
  }

  /**
   * Enum types can be annotated with a default value.
   */
  public function testDefaultEnumType() : void {
    $this->assertResolvers('enum Locale @default @d { EN DE } type Query { locale: Locale! @r }', [
      'Query' => [
        'locale' => $this->builder->defaultValue(
          $this->builder->produce('r'),
          $this->builder->produce('d'),
        ),
      ],
    ]);
  }

  /**
   * Lists can be mapped.
   */
  public function testOptionalMap() : void {
    $this->assertResolvers('type Query { a: [String] @a @map @b }', [
      'Query' => [
        'a' => $this->builder->compose(
          $this->builder->produce('a'),
          $this->builder->map(
            $this->builder->produce('b'),
          )
        ),
      ],
    ]);
  }

  /**
   * Mapping handles default values on all levels.
   */
  public function testMandatoryMap() : void {
    $this->assertResolvers('type Query { a: [String!]! @a @map @b }', [
      'Query' => [
        'a' => $this->builder->compose(
          $this->builder->defaultValue(
            $this->builder->produce('a'),
            $this->builder->fromValue([]),
          ),
          $this->builder->map(
            $this->builder->defaultValue(
              $this->builder->produce('b'),
              $this->builder->fromValue(''),
            ),
          )
        ),
      ],
    ]);
  }

  /**
   * Mapping throws if the nesting does not match the data structure.
   */
  public function testInvalidMapNesting() : void {
    $this->expectException(MapNestingException::class);
    $this->assertResolvers('type Query { a: [String!]! @a @map @b @map @a @b }', []);
  }

  /**
   * Map can operatore over multiple levels.
   */
  public function testNestedMapDirectives(): void {
    $this->assertResolvers('type Query { a: [[String!]]! @a @map @map @a @b }', [
      'Query' => [
        'a' => $this->builder->compose(
          $this->builder->defaultValue(
            $this->builder->produce('a'),
            $this->builder->fromValue([]),
          ),
          $this->builder->map(
            $this->builder->fromParent(),
          ),
          $this->builder->map(
            $this->builder->defaultValue(
              $this->builder->compose(
                $this->builder->produce('a'),
                $this->builder->produce('b'),
              ),
              $this->builder->fromValue(''),
            )
          )
        ),
      ],
    ]);
  }

  /**
   * Object properties use the `@prop` directive automatically.
   *
   * In case there are no directives.
   */
  public function testMagicProp() : void {
    $this->assertResolvers('type Query { a: String }', [
      'Query' => [
        'a' => $this->builder->produce('prop')
          ->map('input', $this->builder->fromParent())
          ->map('property', $this->builder->fromValue('a')),
      ],
    ]);
  }

  /**
   * Automatic `@prop` respects default values.
   */
  public function testNonNullableMagicProp() : void {
    $this->assertResolvers('type Query { a: String! }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('prop')
            ->map('input', $this->builder->fromParent())
            ->map('property', $this->builder->fromValue('a')),
          $this->builder->fromValue(''),
        ),
      ],
    ]);
  }

  /**
   * Automatic `@prop` and mapping is handled correctly.
   */
  public function testMapMagicProp() : void {
    $this->assertResolvers('type Query { a: [[String]!]! }', [
      'Query' => [
        'a' =>
        $this->builder->compose(
          $this->builder->defaultValue(
            $this->builder->produce('prop')
              ->map('input', $this->builder->fromParent())
              ->map('property', $this->builder->fromValue('a')),
            $this->builder->fromValue([]),
          ),
          $this->builder->map(
            $this->builder->defaultValue(
              $this->builder->fromParent(),
              $this->builder->fromValue([]),
            ),
          ),
          $this->builder->map($this->builder->fromParent()),
        ),
      ],
    ]);
  }

  /**
   * If the first directive is `@map`, `@prop` is automatically added.
   */
  public function testMagicPropToMap(): void {
    $this->assertResolvers('type Query { a: [[String]!]! @map @b }', [
      'Query' => [
        'a' =>
        $this->builder->compose(
            $this->builder->defaultValue(
              $this->builder->produce('prop')
                ->map('input', $this->builder->fromParent())
                ->map('property', $this->builder->fromValue('a')),
              $this->builder->fromValue([]),
            ),
            $this->builder->map(
              $this->builder->defaultValue(
                $this->builder->produce('b'),
                $this->builder->fromValue([]),
              ),
            ),
            $this->builder->map($this->builder->fromParent()),
        ),
      ],
    ]);
  }

  /**
   * A directive that has been autoloaded produces a static autoload resolver.
   */
  public function testAutoloadedStaticDirective() : void {
    $this->setAutoloaded([
      "autoStatic" => ["class" => "MyClass", "method" => "test"],
    ]);
    $this->assertResolvers('type Query { a: String @autoStatic }', [
      'Query' => [
        'a' => $this->builder->produce('autoload')
          ->map('service', $this->builder->fromValue(NULL))
          ->map('class', $this->builder->fromValue('MyClass'))
          ->map('method', $this->builder->fromValue('test'))
          ->map('parent', $this->builder->fromParent())
          ->map('args', new Hashmap([])),
      ],
    ]);
  }

  /**
   * A directive that has been autoloaded produces a service autoload resolver.
   */
  public function testAutoloadedServiceDirective() : void {
    $this->setAutoloaded([
      "autoService" => ["service" => "my_service", "method" => "test"],
    ]);
    $this->assertResolvers('type Query { a: String @autoService }', [
      'Query' => [
        'a' => $this->builder->produce('autoload')
          ->map('service', $this->builder->fromValue('my_service'))
          ->map('class', $this->builder->fromValue(NULL))
          ->map('method', $this->builder->fromValue('test'))
          ->map('parent', $this->builder->fromParent())
          ->map('args', new Hashmap([])),
      ],
    ]);
  }

  /**
   * Static arguments are passed into autoload directives.
   */
  public function testAutoloadedStaticArguments() : void {
    $this->setAutoloaded([
      "autoStatic" => ["class" => "MyClass", "method" => "test"],
    ]);
    $this->assertResolvers('type Query { a: String @autoStatic(one: "a", two: 3) }', [
      'Query' => [
        'a' => $this->builder->produce('autoload')
          ->map('service', $this->builder->fromValue(NULL))
          ->map('class', $this->builder->fromValue('MyClass'))
          ->map('method', $this->builder->fromValue('test'))
          ->map('parent', $this->builder->fromParent())
          ->map('args', new Hashmap([
            'one' => $this->builder->fromValue('a'),
            'two' => $this->builder->fromValue(3),
          ])),
      ],
    ]);
  }

  /**
   * Dynamic arguments are passed into autoload directives.
   */
  public function testAutoloadedDynamicArguments() : void {
    $this->setAutoloaded([
      "autoStatic" => ["class" => "MyClass", "method" => "test"],
    ]);
    $this->assertResolvers('type Query { a: String @autoStatic(one: "$one", two: "$") }', [
      'Query' => [
        'a' => $this->builder->produce('autoload')
          ->map('service', $this->builder->fromValue(NULL))
          ->map('class', $this->builder->fromValue('MyClass'))
          ->map('method', $this->builder->fromValue('test'))
          ->map('parent', $this->builder->fromParent())
          ->map('args', new Hashmap([
            'one' => $this->builder->fromArgument('one'),
            'two' => $this->builder->fromParent(),
          ])),
      ],
    ]);
  }

}
