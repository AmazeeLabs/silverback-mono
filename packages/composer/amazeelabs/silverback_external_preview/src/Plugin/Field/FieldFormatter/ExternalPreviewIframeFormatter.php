<?php

namespace Drupal\silverback_external_preview\Plugin\Field\FieldFormatter;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\link\Plugin\Field\FieldFormatter\LinkFormatter;
use GuzzleHttp\Exception\ConnectException;

/**
 * External preview Iframe formatter.
 *
 * @FieldFormatter(
 *   id = "external_preview_iframe_formatter",
 *   label = @Translation("Iframe"),
 *   field_types = {
 *     "link"
 *   }
 * )
 */
class ExternalPreviewIframeFormatter extends LinkFormatter {

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'width' => '100%',
      'height' => 900,
      'view_live_link' => TRUE,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $elements['width'] = [
      '#title' => $this->t('Width'),
      '#type' => 'textfield',
      '#default_value' => $this->getSetting('width'),
      '#required' => TRUE,
    ];
    $elements['height'] = [
      '#title' => $this->t('Height'),
      '#type' => 'textfield',
      '#default_value' => $this->getSetting('height'),
      '#required' => TRUE,
    ];
    $elements['view_live_link'] = [
      '#title' => $this->t('View live link'),
      '#type' => 'radios',
      '#options' => [
        TRUE => $this->t('Yes'),
        FALSE => $this->t('No'),
      ],
      '#default_value' => $this->getSetting('view_live_link'),
      '#required' => FALSE,
    ];
    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];
    $summary[] = $this->t('Width: @width, Height: @height, View live link: @view_live_link', [
      '@width' => $this->getSetting('width'),
      '@height' => $this->getSetting('height'),
      '@view_live_link' => $this->getSetting('view_live_link') ? $this->t('Yes') : $this->t('No'),
    ]);
    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];
    $settings = $this->getSettings();
    // If items turns out to be empty, this denotes an error
    // on the computed field. Do not cache the output so the error
    // message is displayed until it is fixed.
    if (empty($items->getValue())) {
      $elements[0] = [
        '#markup' => $this->t('There was an error when generating the preview.'),
      ];
      $elements['#cache']['max-age'] = 0;
      return $elements;
    }

    // Check if publisher is available.
    /** @var \Drupal\silverback_external_preview\ExternalPreviewLink $externalPreviewLink */
    $externalPreviewLink = \Drupal::service('silverback_external_preview.external_preview_link');
    $publisherBaseUrl = $externalPreviewLink->getPreviewBaseUrl();
    $isPublisherRunning = $this->isPublisherRunning($publisherBaseUrl);
    if (!$isPublisherRunning) {
      $this->messenger()->addError($this->t('Publisher does not seem to be running or available.'));
      $elements['#cache']['max-age'] = 0;
    }

    // Output for preview and live urls.
    foreach ($items as $delta => $item) {
      // Preview url, computed field value.
      $previewUrl = $this->buildUrl($item);
      // Live url.
      $entity = $item->getEntity();
      /** @var \Drupal\silverback_external_preview\ExternalPreviewLink $externalPreviewLink */
      $externalPreviewLink = \Drupal::service('silverback_external_preview.external_preview_link');
      $liveUrl = $externalPreviewLink->createPreviewUrlFromEntity($entity, 'live')->toString();
      $elements[$delta] = [
        '#theme' => 'silverback_external_preview_iframe',
        '#preview_url' => $previewUrl,
        '#live_url' => $liveUrl,
        '#view_live_link' => $this->viewLiveLink($entity, $settings) ,
        '#width' => $settings['width'],
        '#height' => $settings['height'],
      ];
    }
    return $elements;
  }

  private function viewLiveLink(ContentEntityInterface $entity, array $settings) {
    /** @var \Drupal\silverback_external_preview\ExternalPreviewLink $externalPreviewLink */
    $externalPreviewLink = \Drupal::service('silverback_external_preview.external_preview_link');
    return
      !$externalPreviewLink->isNodeRevisionRoute() &&
      !$externalPreviewLink->isUnpublished($entity) &&
      $settings['view_live_link'];
  }

  private function isPublisherRunning(string $preview_base_url) {
    $result = TRUE;
    try {
      \Drupal::httpClient()->request('GET', $preview_base_url);
    }
    catch (ConnectException $exception) {
      $result = FALSE;
    }
    catch (\Exception $exception) {
      // Catch any other Guzzle exception.
    }
    return $result;
  }

}
