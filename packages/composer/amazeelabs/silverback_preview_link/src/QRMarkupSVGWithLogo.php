<?php

namespace Drupal\silverback_preview_link;

use chillerlan\QRCode\Output\QRMarkupSVG;

/**
 * Output interface for QRCode::OUTPUT_CUSTOM.
 */
class QRMarkupSVGWithLogo extends QRMarkupSVG {

  /**
   * {@inheritdoc}
   */
  protected function paths(): string {
    $size = (int) ceil($this->moduleCount * $this->options->svgLogoScale);
    // Calling QRMatrix::setLogoSpace() manually,
    // so QROptions::$addLogoSpace has no effect.
    $this->matrix->setLogoSpace($size, $size);
    $svg = parent::paths();
    $svg .= $this->getLogo();
    return $svg;
  }

  /**
   * {@inheritdoc}
   */
  protected function path(string $path, int $M_TYPE): string {
    // Omit the "fill" and "opacity" attributes on the path element.
    return sprintf('<path class="%s" d="%s"/>', $this->getCssClass($M_TYPE), $path);
  }

  /**
   * Returns a <g> element that contains the SVG logo and positions
   * it properly within the QR Code.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform
   */
  protected function getLogo(): string {
    return sprintf(
      '%5$s<g transform="translate(%1$s %1$s) scale(%2$s)" class="%3$s">%5$s%4$s%5$s</g>',
      (($this->moduleCount - ($this->moduleCount * $this->options->svgLogoScale)) / 2),
      $this->options->svgLogoScale,
      $this->options->svgLogoCssClass,
      file_get_contents($this->options->svgLogo),
      $this->options->eol
    );
  }

}
