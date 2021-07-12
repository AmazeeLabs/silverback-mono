<?php

namespace Drupal\silverback_external_preview;

class BrowserSize {

  /**
   * @var int
   */
  protected $width;

  /**
   * @var int
   */
  protected $height;

  /**
   * @var string
   */
  protected $label;

  /**
   * @var string
   */
  protected $shortLabel;

  /**
   * BrowserSize constructor.
   *
   * @param int $width
   * @param int $height
   * @param string $label
   * @param string $short_label
   */
  public function __construct($width, $height, $label, $short_label) {
    assert(is_int($width));
    assert(is_int($height));
    assert(is_string($label));
    $this->width = $width;
    $this->height = $height;
    $this->label = $label;
    $this->shortLabel = $short_label;
  }

  /**
   * @return int
   */
  public function getWidth() {
    return $this->width;
  }

  /**
   * @return int
   */
  public function getHeight() {
    return $this->height;
  }

  /**
   * @return string
   */
  public function getLabel() {
    return $this->label;
  }

  /**
   * @return string
   */
  public function getShortLabel() {
    return $this->shortLabel;
  }

}
