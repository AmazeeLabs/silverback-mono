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
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Psr7\Response;
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

  /**
   * @var \GuzzleHttp\ClientInterface & \PHPUnit\Framework\MockObject\MockObject
   */
  protected $mockHttpClient;

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
      ->set('netlify_password', 'netlify')
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
    $this->mockHttpClient = $this->prophesize(ClientInterface::class);

    $container->set('silverback_cdn_redirect.http_client', $this->mockHttpClient->reveal());
  }

  public function testNonExistingPath() {
    $this->mockHttpClient
      ->request('GET', 'http://example.com/404')
      ->willReturn(new Response(200, [], 'Not found'));
    $this->assertRewrite('/idontexist', 404, 'Not found');
  }

  public function testInternalPath() {
    $this->mockHttpClient
      ->request('GET', 'http://example.com/404')
      ->willReturn(new Response(200, [], 'Not found'));
    $this->assertRewrite('/user/login', 404, 'Not found');
  }

  public function testNetlifyPassword() {
    $this->mockHttpClient
      ->request('GET', 'http://example.com/404')
      ->willReturn(new Response(401, [], 'Not found'));
    $this->mockHttpClient
      ->request('POST', 'http://example.com/404', ['form_params' => ['password' => 'netlify']])
      ->willReturn(new Response(200, [], 'Not found'));
    $this->assertRewrite('/user/login', 404, 'Not found');
  }

  public function testCSRNode() {
    $this->mockHttpClient
      ->request('GET', 'http://example.com/___csr/page')
      ->willReturn(new Response(200, [], 'Page template'));

    $node = Node::create([
      'title' => 'Test',
      'type' => 'page',
    ]);
    $node->save();

    $this->assertRewrite('/node/' . $node->id(), 200, 'Page template');
  }

  public function testAliasedCSRNode() {
    $this->mockHttpClient
      ->request('GET', 'http://example.com/___csr/page')
      ->willReturn(new Response(200, [], 'Page template'));

    $node = Node::create([
      'title' => 'Test',
      'type' => 'page',
      'path' => ['alias' => '/test'],
    ]);
    $node->save();

    $this->assertRewrite('/test', 200, 'Page template');
  }

  public function testCSRRedirectNode() {
    $this->config('silverback_cdn_redirect.settings')
      ->set('csr_redirect', true)
      ->save();
    $node = Node::create([
      'title' => 'Test',
      'type' => 'page',
    ]);
    $node->save();

    $this->assertRedirect('/node/' . $node->id(), 302, 'http://example.com/___csr/page?id=' . $node->id());
  }

  public function testAliasedCSRRedirectNode() {
    $this->config('silverback_cdn_redirect.settings')
      ->set('csr_redirect', true)
      ->save();
    $node = Node::create([
      'title' => 'Test',
      'type' => 'page',
      'path' => ['alias' => '/test'],
    ]);
    $node->save();

    $this->assertRedirect('/test', 302, 'http://example.com/___csr/page?id=' . $node->id());
  }

  public function testRedirect() {
    $redirect = Redirect::create();
    $redirect->setSource('to/frontpage');
    $redirect->setRedirect('<front>');
    $redirect->setStatusCode(307);
    $redirect->save();

    $this->assertRedirect('/to/frontpage', 307, 'http://example.com/');

    $redirect = Redirect::create();
    $redirect->setSource('to/external');
    $redirect->setRedirect('https://google.com/foo/bar');
    $redirect->setStatusCode(303);
    $redirect->save();

    $this->assertRedirect('/to/external', 303, 'https://google.com/foo/bar');
  }

  public function testNodeAlias() {
    $node = Node::create([
      'title' => 'English with alias',
      'type' => 'page',
      'path' => ['alias' => '/english'],
    ]);
    $node->save();

    $this->assertRedirect('/node/' . $node->id(), 301, 'http://example.com/english');

    $translation = $node->addTranslation('de', $node->toArray());
    $translation->get('path')->alias = '/german';
    $translation->save();

    $this->assertRedirect('/de/node/' . $node->id(), 301, 'http://example.com/de/german');
  }

  protected function assertRedirect(string $path, int $status, string $location): void {
    /** @var \Symfony\Component\HttpKernel\HttpKernelInterface $httpKernel */
    $httpKernel = $this->container->get('http_kernel');

    $request = Request::create('/cdn-redirect' . $path);

    // To make \Drupal\redirect\RedirectChecker::canRedirect pass.
    $request->server->set('SCRIPT_NAME', '/index.php');

    $response = $httpKernel->handle($request);
    $this->assertEquals($status, $response->getStatusCode());
    $this->assertEquals($location, $response->headers->get('Location'));
  }

  protected function assertRewrite(string $path, int $status, string $content): void {
    /** @var \Symfony\Component\HttpKernel\HttpKernelInterface $httpKernel */
    $httpKernel = $this->container->get('http_kernel');

    $request = Request::create('/cdn-redirect' . $path);

    // To make \Drupal\redirect\RedirectChecker::canRedirect pass.
    $request->server->set('SCRIPT_NAME', '/index.php');

    $response = $httpKernel->handle($request);
    $this->assertEquals($status, $response->getStatusCode());
    $this->assertEquals($content, $response->getContent());
  }

}
