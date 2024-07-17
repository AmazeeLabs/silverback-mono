<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\crop\Entity\Crop;
use Drupal\Core\StreamWrapper\PublicStream;

/**
 * @DataProducer(
 *   id = "focal_point",
 *   name = @Translation("Focal Point"),
 *   description = @Translation("Retrieve focal point coordinates for an image source."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Image properties")
 *   ),
 *   consumes = {
 *     "image_props" = @ContextDefinition("any",
 *       label = @Translation("Image Props"),
 *       required = FALSE
 *     )
 *   }
 * )
 */
class FocalPoint extends DataProducerPluginBase {
    /**
     * Resolver to return the focal point coordinates.
     *
     * @param array $image_props
     *
     * @return array|null
     */
    public function resolve(array $image_props = NULL) {
        $path = parse_url($image_props['src']);
        $publicFilesDirectory = '/' . PublicStream::basePath();
        // Reverse-engineer the public path to find the crop.
        $public = 'public:/' . substr($path['path'], strlen($publicFilesDirectory));
        $crop = Crop::findCrop($public, 'focal_point');
        $x = $crop?->x->value;
        $y = $crop?->y->value;
        $image_props['focalPoint'] = $x && $y ? [
            'x' => $x,
            'y' => $y,
        ] : NULL;
        return $image_props;
    }
}
