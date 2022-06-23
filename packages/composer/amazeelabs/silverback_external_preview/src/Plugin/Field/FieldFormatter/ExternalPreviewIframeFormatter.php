<?php

namespace Drupal\silverback_external_preview\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\link\Plugin\Field\FieldFormatter\LinkFormatter;

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
      'class' => 'external-preview-iframe',
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
    $elements['class'] = [
      '#title' => $this->t('Class'),
      '#type' => 'textfield',
      '#default_value' => $this->getSetting('class'),
      '#required' => FALSE,
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
    $summary[] = $this->t('Width: @width, Height: @height, Class: @class, View live link: @view_live_link', [
      '@width' => $this->getSetting('width'),
      '@height' => $this->getSetting('height'),
      '@class' => $this->getSetting('class') == '' ? 'none' : $this->getSetting('class'),
      '@view_live_link' => $this->getSetting('view_live_link') ? $this->t('Yes') : $this->t('No'),
    ]);
    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $element = [];
    $settings = $this->getSettings();
    foreach ($items as $delta => $item) {
      // Preview url, computed field value.
      $previewUrl = $this->buildUrl($item);

      // Live url.
      $entity = $item->getEntity();
      /** @var \Drupal\silverback_external_preview\ExternalPreviewLink $externalPreviewLink */
      $externalPreviewLink = \Drupal::service('silverback_external_preview.external_preview_link');
      $liveUrl = $externalPreviewLink->createPreviewUrlFromEntity($entity, 'live')->toString();
      $element[$delta] = [
        '#theme' => 'silverback_external_preview_iframe',
        '#preview_url' => $previewUrl,
        '#live_url' => $liveUrl,
        '#view_live_link' => !$externalPreviewLink->isNodeRevisionRoute() && $settings['view_live_link'],
        '#width' => $settings['width'],
        '#height' => $settings['height'],
        '#class' => $settings['class'],
      ];
    }
    return $element;
  }

}
