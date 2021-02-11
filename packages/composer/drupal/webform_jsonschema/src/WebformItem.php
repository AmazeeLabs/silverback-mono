<?php

namespace Drupal\webform_jsonschema;

/**
 * Represents a webform element and the webform structure (via $children).
 */
class WebformItem {

  /**
   * Initialized webform element.
   *
   * @var array
   */
  public $element;

  /**
   * Webform element plugin corresponding to $element.
   *
   * @var \Drupal\webform\Plugin\WebformElementInterface
   */
  public $elementPlugin;

  /**
   * Child items (in case if it's a composite element or a wrapper element).
   *
   * @var \Drupal\webform_jsonschema\WebformItem[]
   */
  public $children = [];

}
