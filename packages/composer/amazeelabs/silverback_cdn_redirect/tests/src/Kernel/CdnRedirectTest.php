<?php

namespace Drupal\Tests\silverback_gutenberg\Kernel;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\KernelTests\KernelTestBase;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\redirect\Entity\Redirect;
use Drupal\user\Entity\Role;
use Drupal\user\Entity\User;
use Drupal\user\RoleInterface;
use Symfony\Component\HttpFoundation\Request;

class CdnRedirectTest extends KernelTestBase {

  protected static $modules = [
    'path',
    'path_alias',
    'node',
    'user',
    'system',
    'language',
    'content_translation',
    'link',
    'views',
    'redirect',
    'silverback_cdn_redirect',
  ];

  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('node');
    $this->installEntitySchema('user');
    $this->installEntitySchema('path_alias');
    $this->installEntitySchema('redirect');
    $this->installConfig(['redirect']);

    Role::create([
      'id' => RoleInterface::ANONYMOUS_ID,
      'permissions' => [
        'access content',
      ],
      'label' => 'Anonymous',
    ])->save();

    // Workaround for https://www.drupal.org/project/drupal/issues/3056234
    User::create([
      'name' => '',
      'uid' => 0,
    ])->save();

    $this->installSchema('node', ['node_access']);

    $node_type = NodeType::create(['type' => 'page']);
    $node_type->save();

    $this->installConfig(['language']);
    ConfigurableLanguage::createFromLangcode('de')->save();

    $this->config('silverback_cdn_redirect.settings')
      ->set('base_url', 'http://example.com')
      ->set('404_path', '/404')
      ->save();

    // Let LanguageServiceProvider register its path processors.
    drupal_flush_all_caches();
  }

  public function register(ContainerBuilder $container) {
    parent::register($container);

    // Restore AliasPathProcessor tags which are removed in the parent method.
    $container->getDefinition('path_alias.path_processor')
      ->addTag('path_processor_inbound', ['priority' => 100])
      ->addTag('path_processor_outbound', ['priority' => 300]);
  }

  public function testExistingPath() {
    $this->assertRequest('/user/login', 302, 'http://example.com/404');
  }

  public function testRedirect() {
    $redirect = Redirect::create();
    $redirect->setSource('to/frontpage');
    $redirect->setRedirect('<front>');
    $redirect->setStatusCode(307);
    $redirect->save();

    $this->assertRequest('/to/frontpage', 307, 'http://example.com/');

    $redirect = Redirect::create();
    $redirect->setSource('to/external');
    $redirect->setRedirect('https://google.com/foo/bar');
    $redirect->setStatusCode(303);
    $redirect->save();

    $this->assertRequest('/to/external', 303, 'https://google.com/foo/bar');
  }

  public function testNodeAlias() {
    $node = Node::create([
      'title' => 'English with alias',
      'type' => 'page',
      'path' => ['alias' => '/english'],
    ]);
    $node->save();

    $this->assertRequest('/node/' . $node->id(), 301, 'http://example.com/english');

    $translation = $node->addTranslation('de', $node->toArray());
    $translation->get('path')->alias = '/german';
    $translation->save();

    $this->assertRequest('/de/node/' . $node->id(), 301, 'http://example.com/de/german');
  }

  protected function assertRequest(string $path, int $status, string $location): void {
    /** @var \Symfony\Component\HttpKernel\HttpKernelInterface $httpKernel */
    $httpKernel = $this->container->get('http_kernel');

    $request = Request::create('/cdn-redirect' . $path);

    // To make \Drupal\redirect\RedirectChecker::canRedirect pass.
    $request->server->set('SCRIPT_NAME', '/index.php');

    $response = $httpKernel->handle($request);
    $this->assertEquals($status, $response->getStatusCode());
    $this->assertEquals($location, $response->headers->get('Location'));
  }

}
