<?php

namespace Drupal\silverback_preview_link;

use Drupal\Tests\Component\Annotation\Doctrine\Fixtures\Annotation\Version;
use chillerlan\QRCode\{QRCode, QRCodeException, QROptions};
use chillerlan\QRCode\Data\QRMatrix;
use chillerlan\QRCode\Common\EccLevel;
use Symfony\Component\HttpFoundation\Response;
use function file_exists, gzencode, header, is_readable, max, min;

/**
 * Creates and renders a QR Code with embedded SVG logo.
 */
class QRCodeWithLogo {

  private $config = [
    'svgLogo' => __DIR__ . '/images/amazee-labs_logo-square-green.svg',
    'svgLogoScale' => 1,
    'svgLogoCssClass' => 'dark',
    'version' => QRCode::VERSION_AUTO,
    'outputType' => QRCode::OUTPUT_CUSTOM,
    'outputInterface' => QRMarkupSVGWithLogo::class,
    'imageBase64' => FALSE,
    // ECC level H is necessary when using logos.
    'eccLevel' => EccLevel::H,
    'addQuietzone' => TRUE,
    // If set to TRUE, the light modules won't be rendered.
    'imageTransparent' => FALSE,
    // Empty the default value to remove the fill* attributes from the <path> elements
    'markupDark' => '',
    'markupLight' => '',
    'drawCircularModules' => TRUE,
    'circleRadius' => 0.45,
    'svgConnectPaths' => TRUE,
    'keepAsSquare' => [
      QRMatrix::M_FINDER | QRMatrix::IS_DARK,
      QRMatrix::M_FINDER_DOT,
      QRMatrix::M_ALIGNMENT | QRMatrix::IS_DARK,
    ],
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient
    'svgDefs' => '
	<linearGradient id="gradient" x1="100%" y2="100%">
		<stop stop-color="#951b81" offset="0"/>
		<stop stop-color="#00a29a" offset="0.8"/>
	</linearGradient>
	<style><![CDATA[
		.dark{fill: url(#gradient);}
		.light{fill: #fff;}
	]]></style>',
  ];

  private function getOptions(): QROptions {
    // Augment the QROptions class.
    return new class ($this->config) extends QROptions {

      protected string $svgLogo;

      // Logo scale in % of QR Code size, clamped to 5%-15%.
      protected float $svgLogoScale = 0.20;

      // CSS class for the logo (defined in $svgDefs).
      protected string $svgLogoCssClass = '';

      protected function set_svgLogo(string $svgLogo): void {
        if (!file_exists($svgLogo) || !is_readable($svgLogo)) {
          throw new QRCodeException('invalid svg logo');
        }
        $this->svgLogo = $svgLogo;
      }

      // Clamp logo scale.
      protected function set_svgLogoScale(float $svgLogoScale): void {
        $this->svgLogoScale = max(0.05, min(0.3, $svgLogoScale)) / 2;
      }

    };
  }

  public function getQRCode(string $data) {
    return (new QRCode($this->getOptions()))->render($data);
  }

}
