<?php

namespace Drupal\Tests\cypress\Unit;

use Drupal\cypress\NpmProjectManager;
use Drupal\cypress\ProcessManagerInterface;
use Drupal\Tests\UnitTestCase;
use org\bovigo\vfs\vfsStream;
use Prophecy\Argument;
use Prophecy\Prophecy\ObjectProphecy;
use org\bovigo\vfs\vfsStreamDirectory;

class NpmProjectManagerTest extends UnitTestCase {

  /**
   * @var ObjectProphecy<ProcessManagerInterface>
   */
  protected $processManager;

  /**
   * @var NpmProjectManager
   */
  protected $npmProjectManager;

  /**
   * @var vfsStreamDirectory
   */
  protected $fileSystem;

  /**
   * @var string
   */
  protected $packageDirectory;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->fileSystem = vfsStream::setup();
    $this->processManager = $this->prophesize(ProcessManagerInterface::class);
    $this->packageDirectory = $this->fileSystem->url() . '/drupal';
    $this->npmProjectManager = new NpmProjectManager(
      $this->processManager->reveal(),
      $this->packageDirectory,
      'npm'
    );
  }

  public function testNothingExists(): void {
    $this->processManager->run(['npm', 'init', '-y'], $this->packageDirectory)->shouldBeCalledOnce();
    $this->processManager->run(['npm', 'install'], $this->packageDirectory)->shouldBeCalledOnce();
    $this->npmProjectManager->ensureInitiated();
    $this->assertDirectoryExists($this->packageDirectory);
  }

  public function testDirectoryExists(): void {
    vfsStream::create([
      'drupal' => [],
    ], $this->fileSystem);
    $this->processManager->run(['npm', 'init', '-y'], $this->packageDirectory)->shouldBeCalledOnce();
    $this->processManager->run(['npm', 'install'], $this->packageDirectory)->shouldBeCalledOnce();
    $this->npmProjectManager->ensureInitiated();
    $this->assertDirectoryExists($this->packageDirectory);
  }

  public function testPackageJsonExists(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{}'
      ],
    ], $this->fileSystem);
    $this->processManager->run(['npm', 'init', '-y'], $this->packageDirectory)->shouldNotBeCalled();
    $this->processManager->run(['npm', 'install'], $this->packageDirectory)->shouldBeCalledOnce();
    $this->npmProjectManager->ensureInitiated();
    $this->assertDirectoryExists($this->packageDirectory);
  }

  public function testNodeModulesExists(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{}',
        'node_modules' => [],
      ],
    ], $this->fileSystem);
    $this->processManager->run(['npm', 'init', '-y'], $this->packageDirectory)->shouldNotBeCalled();
    $this->processManager->run(['npm', 'install'], $this->packageDirectory)->shouldNotBeCalled();
    $this->npmProjectManager->ensureInitiated();
    $this->assertDirectoryExists($this->packageDirectory);
  }

  public function testPackageMissing(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{}',
        'node_modules' => [],
      ],
    ], $this->fileSystem);
    $this->processManager->run(['npm', 'init', '-y'], $this->packageDirectory)->shouldNotBeCalled();
    $this->processManager->run(['npm', 'install'], $this->packageDirectory)->shouldNotBeCalled();
    $this->processManager->run(['npm', 'install', 'foo@1.0.0'], $this->packageDirectory)->shouldBeCalledOnce();
    $this->npmProjectManager->ensurePackageVersion('foo', '1.0.0');
    $this->assertDirectoryExists($this->packageDirectory);
  }

  public function testPackageMatches(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{}',
        'node_modules' => [
          'foo' => [
            'package.json' => '{"version": "1.0.0"}',
          ]
        ],
      ],
    ], $this->fileSystem);
    $this->processManager->run(['npm', 'init', '-y'], $this->packageDirectory)->shouldNotBeCalled();
    $this->processManager->run(['npm', 'install'], $this->packageDirectory)->shouldNotBeCalled();
    $this->processManager->run(['npm', 'install', 'foo@1.0.0'], $this->packageDirectory)->shouldNotBeCalled();
    $this->npmProjectManager->ensurePackageVersion('foo', '1.0.0');
    $this->assertDirectoryExists($this->packageDirectory);
  }

  public function testPackageMisses(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{}',
        'node_modules' => [
          'foo' => [
            'package.json' => '{"version": "1.0.0"}',
          ]
        ],
      ],
    ], $this->fileSystem);
    $this->processManager->run(['npm', 'init', '-y'], $this->packageDirectory)->shouldNotBeCalled();
    $this->processManager->run(['npm', 'install'], $this->packageDirectory)->shouldNotBeCalled();
    $this->processManager->run(['npm', 'install', 'foo@2.0.0'], $this->packageDirectory)->shouldBeCalledOnce();
    $this->npmProjectManager->ensurePackageVersion('foo', '2.0.0');
    $this->assertDirectoryExists($this->packageDirectory);
  }

  public function testPackageFuzzyMatches(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{}',
        'node_modules' => [
          'foo' => [
            'package.json' => '{"version": "1.2.0"}',
          ]
        ],
      ],
    ], $this->fileSystem);
    $this->processManager->run(['npm', 'init', '-y'], $this->packageDirectory)->shouldNotBeCalled();
    $this->processManager->run(['npm', 'install'], $this->packageDirectory)->shouldNotBeCalled();
    $this->processManager->run(['npm', 'install', 'foo@^1.1.0'], $this->packageDirectory)->shouldNotBeCalled();
    $this->npmProjectManager->ensurePackageVersion('foo', '^1.1.0');
    $this->assertDirectoryExists($this->packageDirectory);
  }

  public function testPackageFuzzyMisses(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{}',
        'node_modules' => [
          'foo' => [
            'package.json' => '{"version": "1.1.0"}',
          ]
        ],
      ],
    ], $this->fileSystem);
    $this->processManager->run(['npm', 'init', '-y'], $this->packageDirectory)->shouldNotBeCalled();
    $this->processManager->run(['npm', 'install'], $this->packageDirectory)->shouldNotBeCalled();
    $this->processManager->run(['npm', 'install', 'foo@^1.2.0'], $this->packageDirectory)->shouldBeCalledOnce();
    $this->npmProjectManager->ensurePackageVersion('foo', '^1.2.0');
    $this->assertDirectoryExists($this->packageDirectory);
  }

  public function testEmptyMerge(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{}',
        'node_modules' => [],
        'foo' => [
          'package.json' => '{"version": "1.1.0"}',
        ]
      ],
    ], $this->fileSystem);

    $this->processManager->run(Argument::any(), $this->packageDirectory)->shouldNotBeCalled();
    $this->npmProjectManager->merge($this->packageDirectory . '/foo/package.json');
  }

  public function testNewDependency(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{}',
        'node_modules' => [],
        'foo' => [
          'package.json' => '{"version": "1.1.0","dependencies":{"foo":"^1.1.0"}}',
        ]
      ],
    ], $this->fileSystem);

    $this->processManager->run(['npm', 'install', 'foo@^1.1.0'], $this->packageDirectory)->shouldBeCalledOnce();
    $this->npmProjectManager->merge($this->packageDirectory . '/foo/package.json');
  }

  public function testMatchingDependency(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{"dependencies":{"foo":"^1.2.0"}}',
        'node_modules' => [],
        'foo' => [
          'package.json' => '{"version": "1.1.0","dependencies":{"foo":"^1.1.0"}}',
        ]
      ],
    ], $this->fileSystem);

    $this->processManager->run(['npm', 'install', 'foo@^1.1.0'], $this->packageDirectory)->shouldNotBeCalled();
    $this->npmProjectManager->merge($this->packageDirectory . '/foo/package.json');
  }

  public function testDependencyUpdate(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{"dependencies":{"foo":"^1.1.0"}}',
        'node_modules' => [],
        'foo' => [
          'package.json' => '{"version": "1.1.0","dependencies":{"foo":"^1.2.0"}}',
        ]
      ],
    ], $this->fileSystem);

    $this->processManager->run(['npm', 'install', 'foo@^1.2.0'], $this->packageDirectory)->shouldBeCalledOnce();
    $this->npmProjectManager->merge($this->packageDirectory . '/foo/package.json');
  }

  public function testDependencyConflict(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{"dependencies":{"foo":"1.1.0"}}',
        'node_modules' => [],
        'foo' => [
          'package.json' => '{"version": "1.1.0","dependencies":{"foo":"1.2.0"}}',
        ]
      ],
    ], $this->fileSystem);

    $this->expectExceptionMessage("Incompatible versions of package 'foo': 1.2.0 / 1.1.0");
    $this->npmProjectManager->merge($this->packageDirectory . '/foo/package.json');
  }

  public function testNewSettings(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{}',
        'node_modules' => [],
        'foo' => [
          'package.json' => '{"foo":"bar"}',
        ]
      ],
    ], $this->fileSystem);

    $this->npmProjectManager->merge($this->packageDirectory . '/foo/package.json');

    /**
     * @var string $string
     */
    $string = json_encode([
      'foo' => 'bar'
    ]);
    $this->assertJsonStringEqualsJsonFile($this->packageDirectory . '/package.json', $string);
  }

  public function testSettingsUpdate(): void {
    vfsStream::create([
      'drupal' => [
        'package.json' => '{"foo":"bar"}',
        'node_modules' => [],
        'foo' => [
          'package.json' => '{"foo":"baz"}',
        ]
      ],
    ], $this->fileSystem);

    $this->npmProjectManager->merge($this->packageDirectory . '/foo/package.json');

    /**
     * @var string $string
     */
    $string = json_encode([
      'foo' => 'baz'
    ]);
    $this->assertJsonStringEqualsJsonFile($this->packageDirectory . '/package.json', $string);
  }
}
