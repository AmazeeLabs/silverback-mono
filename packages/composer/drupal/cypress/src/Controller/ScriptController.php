<?php

namespace Drupal\cypress\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Execute arbitrary PHP scripts from cypress.
 */
class ScriptController extends ControllerBase {

  /**
   * Execute arbitrary PHP scripts from cypress.
   *
   * @return Response
   */
  public function execute() {
    if (!cypress_enabled()) {
      throw new NotFoundHttpException();
    }
    $contentError = 'Request body has to be JSON and has to contain at least the "script" key.';
    $contentRaw = \Drupal::request()->getContent();
    if (!$contentRaw) {
      return new Response($contentError, 400);
    }
    assert(is_string($contentRaw));
    $content = json_decode($contentRaw);
    if (!$content || !$content->script) {
       return new Response($contentError, 400);
    }

    $suite = FALSE;
    $path = $content->script;
    if (strpos($path, ':') !== FALSE) {
      list($suite, $path) = explode(':', $content->script);
    }

    if ($suite) {
      /** @var array $suites */
      $suites = \Drupal::getContainer()->get('cypress.test_directories');
      if (!array_key_exists($suite, $suites)) {
        return new Response('Unknown test suite "' . $suite . '".', 404);
      }
      $path = $suites[$suite] . '/' . $path;
      if (!file_exists($path)) {
        return new Response('File "' . $path . '" not found in suite "' . $suite . ' (' . $suites[$suite] . ')".', 404);
      }
    }
    if (!file_exists($path)) {
      return new Response('File "' . $path . '" not found.', 404);
    }

    // Used by the included script.
    $args = $content->args ?? new \stdClass();

    ob_start();
    try {
      include $path;
    }
    catch (\Throwable $e) {
      return new Response($e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
    }
    $response = ob_get_clean();

    return new Response($response);
  }

}
