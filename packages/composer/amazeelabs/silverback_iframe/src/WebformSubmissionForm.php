<?php

namespace Drupal\silverback_iframe;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\silverback_gutenberg\LinkProcessor;
use Drupal\webform\WebformInterface;
use Drupal\webform\WebformMessageManagerInterface;
use Drupal\webform\WebformSubmissionForm as Original;

class WebformSubmissionForm extends Original {

  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form = parent::buildForm($form, $form_state);

    // Pass the message to frontend.
    $request = \Drupal::request();
    if ($request->query->has('iframe_message')) {
      $form['#attached']['drupalSettings']['iframeCommand'] = [
        'action' => 'displayMessages',
        'messages' => [$request->query->get('iframe_message')],
      ];
      $request->query->remove('iframe_message');
    }
    $form['#cache']['contexts'][] = 'url.query_args';

    return $form;
  }

  public function confirmForm(array &$form, FormStateInterface $form_state): void {
    if (!silverback_iframe_theme_enabled()) {
      parent::confirmForm($form, $form_state);
      return;
    }

    $webform = $this->getWebform();
    $confirmationType = $webform->getSetting('confirmation_type');

    // Make the webform module do nothing about the confirmation message.
    $webform->setSetting('confirmation_type', WebformInterface::CONFIRMATION_NONE);

    parent::confirmForm($form, $form_state);

    switch ($confirmationType) {
      case WebformInterface::CONFIRMATION_URL:
        // Just redirect.
        $this->respondWithCommand([
          'action' => 'redirect',
          'path' => $this->getRedirectPath(),
        ], $form_state);
        break;

      case WebformInterface::CONFIRMATION_URL_MESSAGE:
        // Redirect with message.
        $this->respondWithCommand([
          'action' => 'redirect',
          'path' =>  $this->getRedirectPath(),
          'messages' => [$this->getMessage()],
        ], $form_state);
        break;

      case WebformInterface::CONFIRMATION_MESSAGE:
        // Prepare the default form redirect as it's done in FormSubmitter.
        $url = Url::fromRoute('<current>', [], [
          'query' => \Drupal::request()->query->all(),
          'absolute' => TRUE,
        ]);
        $message = $this->getMessage();
        if (strpos($message, 'js-iframe-parent-message') !== FALSE) {
          // Fallback to the default behavior if we see a special class in the
          // message HTML.
          // See Drupal.behaviors.silverbackIframeRedirect
          $this->getMessageManager()->display(WebformMessageManagerInterface::SUBMISSION_CONFIRMATION_MESSAGE);
          $form_state->setRedirectUrl($url);
        }
        else {
          // Display message above the form.
          $url->setOption('query', [
            // Pass the message in the URL to not mess with session. User won't
            // see it anyway.
            'iframe_message' => $this->getMessage(),
          ] + \Drupal::request()->query->all());
          $form_state->setRedirectUrl($url);
        }
        break;

      case WebformInterface::CONFIRMATION_NONE:
        // Do nothing.
        break;

      case WebformInterface::CONFIRMATION_INLINE:
      default:
        // Replace the iframe with message.
        $this->respondWithCommand([
          'action' => 'replaceWithMessages',
          'messages' => [$this->getMessage()],
        ], $form_state);
        break;
    }
  }

  private function respondWithCommand(array $command, FormStateInterface $form_state): void {
    $content = [
      '#type' => 'page',
      '#title' => '',
      '#attached' => [
        'drupalSettings' => [
          'iframeCommand' => $command,
        ],
      ],
    ];
    /** @var \Drupal\Core\Render\MainContent\HtmlRenderer $htmlRenderer */
    $htmlRenderer = \Drupal::service('main_content_renderer.html');
    $response = $htmlRenderer->renderResponse($content, \Drupal::request(), \Drupal::routeMatch());
    $form_state->setResponse($response);
  }

  private function getMessage(): string {
    $message = $this->getMessageManager()
      ->render(WebformMessageManagerInterface::SUBMISSION_CONFIRMATION_MESSAGE);
    return $message;
  }

  private function getRedirectPath(): string {
    // Don't use $this->getConfirmationUrl() because it returns absolute URL.
    $url = trim($this->getWebformSetting('confirmation_url', ''));

    try {
      $parts = parse_url($url);
      if (!is_array($parts)) {
        throw new \Exception('Cannot parse URL.');
      }
      if (empty($parts['path']) && empty($parts['host'])) {
        throw new \Exception('URL contains no host nor path.');
      }
    } catch (\Throwable $e) {
      $this->logger('silverback_iframe')->warning('Bad webform redirect URL. Debug: {debug}', [
        'debug' => json_encode([
          'url' => $url,
          'webformId' => $this->getWebform()->id(),
          'error' => $e->getMessage(),
        ]),
      ]);
      $url = '/';
    }

    // Ensure that the redirect URL has correct language prefix.
    /** @var \Drupal\silverback_gutenberg\LinkProcessor $linkProcessor */
    $linkProcessor = \Drupal::service(LinkProcessor::class);
    $url = $linkProcessor->processUrl($url, 'inbound');
    $url = $linkProcessor->processUrl(
      $url,
      'outbound',
      \Drupal::languageManager()->getCurrentLanguage()
    );

    return $url;
  }

}
