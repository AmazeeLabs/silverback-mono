<?php

namespace Drupal\Tests\graphql_directives\Unit;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql_directives\DirectiveInterpreter;
use Drupal\graphql_directives\MapNestingException;
use Drupal\graphql_directives\MissingDefaultException;
use Drupal\graphql_directives\Plugin\GraphQL\Directive\Prop;
use Drupal\Tests\UnitTestCase;
use GraphQL\Language\Parser;

class TestResolver implements ResolverInterface {

  public function __construct(public $value, public $args = []) {
  }

  public function resolve($value, $args, $context, $info, $field) {
  }

  public function map($key, ResolverInterface $value) {
    $this->args[$key] = $value;
    return $this;
  }

}

class TestDirective implements DirectiveInterface {

  public function __construct(public $id) {
  }

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    $resolver = new TestResolver(['produce', $this->id]);
    foreach ($arguments as $key => $value) {
      $resolver->map($key, $builder->fromValue($value));
    }
    return $resolver;
  }

}

class DirectiveInterpreterTest extends UnitTestCase {

  protected ResolverBuilder $builder;

  protected PluginManagerInterface $directiveManager;

  protected function setUp(): void {
    parent::setUp();
    $this->directiveManager = $this->createMock(PluginManagerInterface::class);

    // The directive manager only knows about fictional directives from @a to @z.
    $this->directiveManager->method('hasDefinition')
      ->willReturnCallback(fn($id) => $id === 'prop' || preg_match('/^[a-z]$/', $id));
    // And returns a TestResolver with that requested id as value.
    $this->directiveManager->method('createInstance')
      ->willReturnCallback(fn($id) => $id === 'prop' ? new Prop([], 'prop', []) : new TestDirective($id));

    $this->builder = $this->createMock(ResolverBuilder::class);
    $this->builder->method('produce')
      ->willReturnCallback(fn($id) => new TestResolver(['produce', $id]));
    $this->builder->method('fromValue')
      ->willReturnCallback(fn($value) => new TestResolver(['value', $value]));
    $this->builder->method('fromParent')
      ->willReturnCallback(fn() => new TestResolver(['parent']));
    $this->builder->method('fromContext')
      ->willReturnCallback(fn($name) => new TestResolver(['context', $name]));
    $this->builder->method('fromArgument')
      ->willReturnCallback(fn($name) => new TestResolver(['argument', $name]));
    $this->builder->method('compose')
      ->willReturnCallback(fn(...$resolvers) => new TestResolver([
        'compose',
        ...$resolvers,
      ]));
    $this->builder->method('defaultValue')
      ->willReturnCallback(fn(...$resolvers) => new TestResolver([
        'default',
        ...$resolvers,
      ]));

    $this->builder->method('map')
      ->willReturnCallback(fn(...$resolvers) => new TestResolver([
        'map',
        ...$resolvers,
      ]));
  }

  protected function assertResolvers(string $schema, array $expected) {
    $parsed = Parser::parse($schema);
    $interpreter = new DirectiveInterpreter($parsed, $this->builder, $this->directiveManager);
    $interpreter->interpret();
    $this->assertEquals($expected, array_merge(
      $interpreter->getTypeResolvers(),
      $interpreter->getFieldResolvers(),
    ));
  }

  public function testNoDirectives() {
    $this->assertResolvers('type Query { a: String }', [
      'Query' => [
        'a' => $this->builder->produce('prop')
          ->map('input', $this->builder->fromParent())
          ->map('property', $this->builder->fromValue('a')),
      ],
    ]);
  }

  public function testNoKnownDirectives() {
    $this->assertResolvers('type Query { a: String @unknown }', [
      'Query' => [
        'a' => $this->builder->produce('prop')
          ->map('input', $this->builder->fromParent())
          ->map('property', $this->builder->fromValue('a')),
      ],
    ]);
  }

  public function testSingleDirective() {
    $this->assertResolvers('type Query { a: String @a }', [
      'Query' => [
        'a' => $this->builder->produce('a'),
      ],
    ]);
  }

  public function testChainedDirectives() {
    $this->assertResolvers('type Query { a: String @a @b }', [
      'Query' => [
        'a' => $this->builder->compose(
          $this->builder->produce('a'),
          $this->builder->produce('b'),
        ),
      ],
    ]);
  }


  public function testNullArgument() {
    $this->assertResolvers('type Query { a: String @a(b: null) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(NULL)),
      ],
    ]);
  }

  public function testIntArgument() {
    $this->assertResolvers('type Query { a: String @a(b: 0, c: -1) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(0))
          ->map('c', $this->builder->fromValue(-1)),
      ],
    ]);
  }

  public function testFloatArgument() {
    $this->assertResolvers('type Query { a: String @a(b: 1.34) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(1.34)),
      ],
    ]);
  }

  public function testStringArgument() {
    $this->assertResolvers('type Query { a: String @a(b: "c") }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue('c')),
      ],
    ]);
  }

  public function testEnumArgument() {
    $this->assertResolvers('type Query { a: String @a(b: C) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue('C')),
      ],
    ]);
  }

  public function testObjectArgument() {
    $this->assertResolvers('type Query { a: String @a(b: {c: "d"}) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(['c' => 'd'])),
      ],
    ]);
  }

  public function testListArgument() {
    $this->assertResolvers('type Query { a: String @a(b: ["c", "d"]) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(['c', 'd'])),
      ],
    ]);
  }

  public function testNestedListArgument() {
    $this->assertResolvers('type Query { a: String @a(b: ["c", ["d"]]) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(['c', ['d']])),
      ],
    ]);
  }

  public function testComplexArgument() {
    $this->assertResolvers('type Query { a: String @a(b: {c: ["d", "e"]}) }', [
      'Query' => [
        'a' => $this->builder->produce('a')
          ->map('b', $this->builder->fromValue(['c' => ['d', 'e']])),
      ],
    ]);
  }

  public function testOptional() {
    $this->assertResolvers('type Query { a: String @a }', [
      'Query' => [
        'a' => $this->builder->produce('a'),
      ],
    ]);
  }

  public function testDefaultBoolean() {
    $this->assertResolvers('type Query { a: Boolean! @a }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('a'),
          $this->builder->fromValue(FALSE),
        ),
      ],
    ]);
  }

  public function testDefaultID() {
    $this->assertResolvers('type Query { a: ID! @a }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('a'),
          $this->builder->fromValue('#'),
        ),
      ],
    ]);
  }

  public function testDefaultString() {
    $this->assertResolvers('type Query { a: String! @a }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('a'),
          $this->builder->fromValue(''),
        ),
      ],
    ]);
  }

  public function testDefaultInt() {
    $this->assertResolvers('type Query { a: Int! @a }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('a'),
          $this->builder->fromValue(0),
        ),
      ],
    ]);
  }

  public function testDefaultFloat() {
    $this->assertResolvers('type Query { a: Float! @a }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('a'),
          $this->builder->fromValue(0.0),
        ),
      ],
    ]);
  }

  public function testDefaultList() {
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

  public function testMultiDefault() {
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

  public function testUnknownType() {
    $this->expectException(MissingDefaultException::class);
    $this->assertResolvers('type Query { a: Unknown! @a }', []);
  }

  public function testDefaultScalarType() {
    $this->assertResolvers('scalar Email @default @c type Query { a: Email! @b }', [
      'Query' => [
        'a' => $this->builder->defaultValue(
          $this->builder->produce('b'),
          $this->builder->produce('c'),
        ),
      ],
    ]);
  }

  public function testDefaultObjectType() {
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

  public function testDefaultInterfaceType() {
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

  public function testDefaultUnionType() {
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

  public function testDefaultEnumType() {
    $this->assertResolvers('enum Locale @default @d { EN DE } type Query { locale: Locale! @r }', [
      'Query' => [
        'locale' => $this->builder->defaultValue(
          $this->builder->produce('r'),
          $this->builder->produce('d'),
        ),
      ],
    ]);
  }

  public function testOptionalMap() {
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

  public function testMandatoryMap() {
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

  public function testInvalidMapNesting() {
    $this->expectException(MapNestingException::class);
    $this->assertResolvers('type Query { a: [String!]! @a @map @b @map @a @b }', []);
  }

  public function testNestedMapDirectives() {
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

  public function testMagicProp() {
    $this->assertResolvers('type Query { a: String }', [
      'Query' => [
        'a' => $this->builder->produce('prop')
          ->map('input', $this->builder->fromParent())
          ->map('property', $this->builder->fromValue('a')),
      ],
    ]);
  }

  public function testNonNullableMagicProp() {
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

  public function testMapMagicProp() {
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

  public function testMagicPropToMap() {
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

}
