<?php

namespace Drupal\silverback_cloudinary\Plugin\GraphQL\DataProducer;

use Cloudinary\Asset\DeliveryType;
use Cloudinary\Tag\ImageTag;
use Cloudinary\Transformation\Resize;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;

/**
 * Resolves a responsive image
 *
 * @DataProducer(
 *   id = "responsive_image",
 *   name = @Translation("Responsive image"),
 *   description = @Translation("Resolver for responsive images using the cloudinary service."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("The responsive image details")
 *   ),
 *   consumes = {
 *     "image" = @ContextDefinition("string",
 *       label = @Translation("The public url of the original image")
 *     ),
 *     "config" = @ContextDefinition("any",
 *       label = @Translation("The responsive image config object"),
 *       required = FALSE
 *     ),
 *   }
 * )
 */
class ResponsiveImage extends DataProducerPluginBase {
  public function resolve($image, $config = NULL) {
    $return = [
      'src' => $image
    ];
    // If no config object is given, we just return the original image url.
    if (empty($config)) {
      return $return;
    }
    // The image width and height in the response should be the same as the ones
    // sent as parameters.
    // @todo: Unless the width sent is bigger than the width of the original
    // image, since we should not scale up. TBD what to do in this case.
    $width = $config['width'] ?? NULL;
    $height = $config['height'] ?? NULL;
    $transform = $config['transform'] ?? NULL;
    $return['width'] = $width;
    $return['height'] = $height;
    if (!empty($config['sizes'])) {
      $return['sizes'] = $this->buildSizesString($config['sizes'], $width);
      $return['srcset'] = $this->buildSrcSetString($image, $config['sizes'], ['width' => $width, 'height' => $height], $transform);
    }

    $return['src'] = $this->getCloudinaryImageUrl($image, ['width' => $width, 'height' => $height, 'transform' => $transform]);
    if (!empty($config['variants'])) {
      $sources = [];
      foreach ($config['variants'] as $variant) {
        $variantWidth = $variant['width'] ?? NULL;
        $variantHeight = $variant['height'] ?? NULL;
        $variantTransform = $variant['transform'] ?? NULL;
        $source = [
          'media' => $variant['media'],
          'width' => $variantWidth,
          'height' => $variantHeight,
        ];
        if (!empty($variant['sizes'])) {
          $source['sizes'] = $this->buildSizesString($variant['sizes'], $variantWidth);
          $source['srcset'] = $this->buildSrcSetString($image, $variant['sizes'], ['width' => $variantWidth, 'height' => $variantHeight], $variantTransform);
        } else {
          // If we have no sizes defined, then we just put one single url in the
          // srcset, the path to the image to display.
          $source['srcset'] = $this->getCloudinaryImageUrl($image, ['width' => $variantWidth, 'height' => $variantHeight, 'transform' => $variantTransform]);
        }
        $sources[] = array_filter($source);
      }
      $return['sources'] = $sources;
    }

    return array_filter($return);
  }

  /**
   * Builds a sizes string from a sizes array.
   *
   * @param array $sizes
   *  An array of image sizes.
   *  Example: [
   *    [400, 390] -> up until 400px screen width, use the 390px image
   *    [800, 780] -> up until 800px screen width, use the 780px image
   *  ]
   * @param int $default_width
   *  The default width to add at the end of the $sizes string.
   * @return void
   */
  protected function buildSizesString(array $sizes, $default_width = NULL) {
    if (empty($sizes)) {
      return '';
    }
    $sizeEntries = array_reduce($sizes, function($carry, $sizesElement) {
      // Each size must have exactly 2 elements.
      if (count($sizesElement) !== 2) {
        return $carry;
      }
      $carry[] = "(max-width: $sizesElement[0]px) $sizesElement[1]px";
      return $carry;
    }, []);

    // At the end, add the default width.
    if (!empty($default_width)) {
      $sizeEntries[] = $default_width . 'px';
    }
    return !empty($sizeEntries) ? implode(', ', $sizeEntries) : '';
  }

  /**
   * Builds a srcset string for an original image, based on a sizes array.
   *
   * @param string $originalUrl
   *  The original image url
   * @param array $sizes
   *  A sizes array, same is in buildSizesString().
   * @param array $defaultDimensions
   *  The default dimensions (width and, optionally, height) of the image so
   *  that we can compute the height of each of the image in the src set, by
   *  preserving the aspect ratio.
   * @param string $transform
   *  A string that can be any other cloudinary transformation to be added to
   *  each of the resulted images in the src set.
   * @return string
   */
  protected function buildSrcSetString($originalUrl, array $sizes, array $defaultDimensions = [], string $transform = NULL) {
    if (empty($sizes)) {
      return '';
    }
    $srcSetEntries = array_reduce($sizes, function($carry, $sizesElement) use ($defaultDimensions, $originalUrl, $transform) {
      // Each size must have exactly 2 elements.
      if (count($sizesElement) !== 2) {
        return $carry;
      }
      $imageConfig = [
        'width' => $sizesElement[1],
        'transform' => $transform ?? NULL,
      ];
      // If we know the default dimensions of the image, and the width of the
      // desired one, we can also calculate the height of it.
      if (!empty($defaultDimensions['width']) && !empty($defaultDimensions['height'])) {
        $imageConfig['height'] = (int) round(($imageConfig['width'] * $defaultDimensions['height']) / $defaultDimensions['width']);
      }
      $carry[] = $this->getCloudinaryImageUrl($originalUrl, $imageConfig) . ' ' . $imageConfig['width'] . 'w';
      return $carry;
    }, []);

    if (empty($srcSetEntries)) {
      return '';
    }
    return implode(', ', $srcSetEntries);
  }

  /**
   * Helper method to return a simple cloudinary image url for an image url and
   * a config array.
   *
   * The config array can contain a width and a height, as well as a transform
   * key which holds any other transformation to be added to the resulted
   * image.
   *
   * @param string $originalUrl
   * @param array $config
   * @return string
   */
  protected function getCloudinaryImageUrl($originalUrl, array $config = []) {
    $image = (new ImageTag($originalUrl));
    // We do not want the additional '_a" query parameter on the urls. If we
    // do not set it to FALSE, every image url will have a additional '_a' query
    // parameter, see Cloudinary\Asset\Analytics for its implementation.
    $image->setUrlConfig('analytics', FALSE);
    $image->deliveryType(DeliveryType::FETCH);
    // All the image URLs will be signed and have the f_auto transformation so
    // that they are delivered in the appropriate format (webp, avif, etc.)
    $image->signUrl(TRUE);
    $image->format('auto');
    $width = $config['width'] ?? NULL;
    $height = $config['height'] ?? NULL;
    if (!empty($width) || !empty($height)) {
      // If both, width and height, are provided, then we resize the image.
      if (!empty($width) && !empty($height)) {
        $image->resize(Resize::fill($width, $height));
      }
      // Otherwise, if only one of them is provided, we scale it.
      else {
        $image->scale($width, $height);
      }

    }
    if (!empty($config['transform'])) {
      $image->addTransformation($config['transform']);
    }
    return $image->image->toUrl()->__toString();
  }
}
