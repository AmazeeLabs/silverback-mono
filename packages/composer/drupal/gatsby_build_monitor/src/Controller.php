<?php

namespace Drupal\gatsby_build_monitor;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class BuildStats {
  public string $started;
  public string $finished;
  public string $output;
}

class Controller {

  public function setState(Request $request) {
    $mode = \Drupal::config('gatsby_build_monitor.settings')->get('build_end_mode');
    if ($mode && $mode !== 'gatsby-plugin-build-monitor') {
      return Response::create('The module is not configured to receive notifications from gatsby-plugin-build-monitor.', 503);
    }

    $token = \Drupal::config('gatsby_build_monitor.settings')->get('token');
    if (!$token) {
      return Response::create('Token is not configured', 503);
    }
    if ($request->headers->get('token') !== $token) {
      return Response::create('Token is not valid', 401);
    }

    $jsonSchema = file_get_contents(__DIR__ . '/Controller.setState.schema.json');
    $payload = json_decode($request->getContent());
    $validator = new \JsonSchema\Validator();
    $validator->validate($payload, json_decode($jsonSchema));
    if ($validator->isValid()) {
      _gatsby_build_monitor_state($payload->status);
      if ($payload->status === 'idle' && $payload->buildStats) {
        $this->saveBuildStats($payload->buildStats);
      }
      return Response::create();
    }
    else {
      $response = "The payload is not valid.\n\nErrors:\n";
      foreach ($validator->getErrors() as $error) {
        $response .= sprintf("[%s] %s\n", $error['property'], $error['message']);
      }
      $response .= "\nJSON Schema:\n" . $jsonSchema;
      return Response::create($response, 400, [
        'Content-Type' => 'text/plain; charset=UTF-8',
      ]);
    }
  }

  /**
   * @param string $token
   * @param string $state
   *   Values: "build-success", "build-failure", "deploy-success" or
   *   "deploy-failure".
   */
  public function gatsbyCloudNotifications($token, $state) {
    if (\Drupal::config('gatsby_build_monitor.settings')->get('build_end_mode') !== 'gatsby-cloud-notifications') {
      return Response::create('The module is not configured to receive notifications from Gatsby Cloud.', 503);
    }

    $savedToken = \Drupal::config('gatsby_build_monitor.settings')->get('token');
    if (!$savedToken) {
      return Response::create('Token is not configured', 503);
    }
    if ($token !== $savedToken) {
      return Response::create('Token is not valid', 401);
    }

    switch ($state) {
      case 'build-success':
      case 'deploy-success':
        _gatsby_build_monitor_state('idle');
        break;
      case 'build-failure':
      case 'deploy-failure':
        _gatsby_build_monitor_state('failure');
        break;
      default:
        throw new \Exception('Unknown state.');
    }

    return Response::create();
  }

  public function getState() {
    return JsonResponse::create([
      'state' => _gatsby_build_monitor_state(),
      'timestamp' => \Drupal::state()->get('gatsby_build_monitor.state_updated'),
    ]);
  }

  /**
   * @param BuildStats $buildStats
   */
  protected function saveBuildStats($buildStats) {
    $started = (new \DateTime($buildStats->started))->getTimestamp();
    $finished = (new \DateTime($buildStats->finished))->getTimestamp();
    \Drupal::database()
      ->insert('gatsby_build_monitor_stats')
      ->fields([
        'started' => $started,
        'finished' => $finished,
        'spent' => $finished - $started,
        'output' => $buildStats->output,
        'has_errors' => mb_stripos($buildStats->output, 'error') === FALSE ? 0 : 1,
        'has_warnings' => mb_stripos($buildStats->output, 'warning') === FALSE ? 0 : 1,
      ])
      ->execute();
  }

}
