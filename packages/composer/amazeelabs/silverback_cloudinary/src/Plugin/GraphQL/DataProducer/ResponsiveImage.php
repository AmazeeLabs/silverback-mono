<?php

namespace Drupal\silverback_cloudinary\Plugin\GraphQL\DataProducer;

use Cloudinary\Asset\DeliveryType;
use Cloudinary\Tag\ImageTag;
use Cloudinary\Transformation\Gravity;
use Cloudinary\Transformation\Resize;
use Drupal\Component\Serialization\Json;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;

/**
 * Resolves a responsive image
 *
 * @DataProducer(
 *   id = "responsive_image",
 *   name = @Translation("Responsive image"),
 *   description = @Translation("Resolver for responsive images using the cloudinary service."),
 *   produces = @ContextDefinition("string",
 *     label = @Translation("The responsive image details, encoded as in a json string")
 *   ),
 *   consumes = {
 *     "image" = @ContextDefinition("string",
 *       label = @Translation("The public url of the original image")
 *     ),
 *     "width" = @ContextDefinition("integer",
 *       label = @Translation("The width of the generated image"),
 *       required = FALSE
 *     ),
 *     "height" = @ContextDefinition("integer",
 *       label = @Translation("The width of the generated image"),
 *       required = FALSE
 *     ),
 *     "sizes" = @ContextDefinition("any",
 *       label = @Translation("Additional sizes for the generated image, specified as an array of touples"),
 *       required = FALSE,
 *       multiple = TRUE
 *     ),
 *     "transform" = @ContextDefinition("string",
 *       label = @Translation("An arbitrary cloudinary transformation string"),
 *       required = FALSE
 *     ),
 *   }
 * )
 */
class ResponsiveImage extends DataProducerPluginBase {
  public function resolve($image, $width = NULL, $height = NULL, $sizes = NULL, $transform = NULL) {
    if (!$image) {
      return NULL;
    }
    $return = $image;
    $return['originalSrc'] = $image['src'];
    // If no width is given, we just return the original image url.
    if (empty($width)) {
      return Json::encode($return);
    }
    $ratio = $image['height'] / $image['width'];
    // The image width and height in the response should be the same as the ones
    // sent as parameters.
    // @todo: Unless the width sent is bigger than the width of the original
    // image, since we should not scale up. TBD what to do in this case.
    $return['width'] = $width;
    $return['height'] = $height ?: round($width * $ratio);
    if (!empty($sizes)) {
      $return['sizes'] = $this->buildSizesString($sizes, $width);
      $return['srcset'] = $this->buildSrcSetString($image['src'], $sizes, ['width' => $width, 'height' => $height], $transform);
    }
    $return['src'] = $this->getCloudinaryImageUrl($image['src'], ['width' => $width, 'height' => $height, 'transform' => $transform]);

    $return = array_filter($return);
    return $return ? Json::encode($return) : NULL;
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
    $sizeEntries = array_reduce($sizes, function ($carry, $sizesElement) {
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
    $srcSetEntries = array_reduce($sizes, function ($carry, $sizesElement) use ($defaultDimensions, $originalUrl, $transform) {
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
    // If the cloud name is "local" return the original image.
    // For local testing.
    if (strpos(getenv('CLOUDINARY_URL'), '@local')) {
      return $originalUrl;
    }
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
    $image->quality('auto');
    $width = $config['width'] ?? NULL;
    $height = $config['height'] ?? NULL;
    if (!empty($width) || !empty($height)) {
      // If both, width and height, are provided, then we resize the image.
      if (!empty($width) && !empty($height)) {
        $image->resize(Resize::fill($width, $height)->gravity(Gravity::auto()));
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