<?php

namespace Drupal\Tests\silverback_cloudinary\Kernel\DataProducer;

use Drupal\Tests\graphql\Kernel\GraphQLTestBase;

class ResponsiveImageTest extends GraphQLTestBase {

  protected static $modules = ['silverback_cloudinary'];

  /**
   * @covers \Drupal\silverback_cloudinary\Plugin\GraphQL\DataProducer\ResponsiveImage::resolve
   */
  public function testResponsiveImage(): void {
    $image = 'http://www.example.com/test_image.png';

    // Case 1. No config parameter sent.
    $result = $this->executeDataProducer('responsive_image', [
      'image' => $image,
      'config' => NULL,
    ]);
    $this->assertEquals(['src' => 'http://www.example.com/test_image.png'], $result);

    // Case 2. Only ask for a width (so just scale the image).
    $result = $this->executeDataProducer('responsive_image', [
      'image' => $image,
      'config' => [
        'width' => 600,
      ],
    ]);
    $this->assertEquals('f_auto/c_scale,w_600/http://www.example.com/test_image.png', $this->getCloudinaryTransformationStringFromUrl($result['src']));
    $this->assertEquals(
      [
        'width' => 600,
      ],
      array_filter(array_diff_key($result, ['src' => ''])),
    );

    // Case 3. Ask for a width and height.
    $result = $this->executeDataProducer('responsive_image', [
      'image' => $image,
      'config' => [
        'width' => 600,
        'height' => 400,
      ],
    ]);
    $this->assertEquals('f_auto/c_fill,h_400,w_600/http://www.example.com/test_image.png', $this->getCloudinaryTransformationStringFromUrl($result['src']));
    $this->assertEquals(
      [
        'width' => 600,
        'height' => 400,
      ],
      array_filter(array_diff_key($result, ['src' => ''])),
    );

    // Case 4. Ask for a custom transformation.
    $result = $this->executeDataProducer('responsive_image', [
      'image' => $image,
      'config' => [
        'width' => 600,
        'height' => 400,
        'transform' => 'c_lfill,h_150,w_150',
      ],
    ]);
    $this->assertEquals('f_auto/c_fill,h_400,w_600/c_lfill,h_150,w_150/http://www.example.com/test_image.png', $this->getCloudinaryTransformationStringFromUrl($result['src']));
    $this->assertEquals(
      [
        'width' => 600,
        'height' => 400,
      ],
      array_filter(array_diff_key($result, ['src' => ''])),
    );

    // Case 5. Ask for sizes.
    $result = $this->executeDataProducer('responsive_image', [
      'image' => $image,
      'config' => [
        'width' => 1600,
        'sizes' => [
          [800, 780],
          [1200, 1100],
        ],
      ],
    ]);
    $this->assertEquals('f_auto/c_scale,w_1600/http://www.example.com/test_image.png', $this->getCloudinaryTransformationStringFromUrl($result['src']));
    $this->assertEquals(
      [
        'width' => 1600,
        'sizes' => '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
      ],
      array_filter(array_diff_key($result, ['src' => '', 'srcset' => ''])),
    );
    $srcset = explode(', ', $result['srcset']);
    $srcsetOneParts = explode(' ', $srcset[0]);
    $this->assertEquals('f_auto/c_scale,w_780/http://www.example.com/test_image.png 780w',  $this->getCloudinaryTransformationStringFromUrl($srcsetOneParts[0]) . ' ' . $srcsetOneParts[1]);
    $srcsetTwoParts = explode(' ', $srcset[1]);
    $this->assertEquals('f_auto/c_scale,w_1100/http://www.example.com/test_image.png 1100w',  $this->getCloudinaryTransformationStringFromUrl($srcsetTwoParts[0]) . ' ' . $srcsetTwoParts[1]);

    // Case 6. Ask for variants, no height, only the width.
    $result = $this->executeDataProducer('responsive_image', [
      'image' => $image,
      'config' => [
        'width' => 1600,
        'sizes' => [
          [800, 780],
          [1200, 1100],
        ],
        'variants' => [
          [
            'media' => '(max-width: 800px) and (orientation: portrait)',
            'width' => 800,
            'sizes' => [
              [400, 380],
              [600, 580]
            ],
            'transform' => 'co_rgb:000000,e_colorize:60',
          ],
          [
            'media' => '(max-width: 1200px) and (orientation: portrait)',
            'width' => 1200,
            'sizes' => [
              [1000, 980],
              [1100, 1080]
            ],
            'transform' => 'co_rgb:000000,e_colorize:30',
          ]
        ],
      ],
    ]);
    $this->assertEquals('f_auto/c_scale,w_1600/http://www.example.com/test_image.png', $this->getCloudinaryTransformationStringFromUrl($result['src']));
    $this->assertEquals(
      [
        'width' => 1600,
        'sizes' => '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
      ],
      array_filter(array_diff_key($result, ['src' => '', 'srcset' => '', 'sources' => ''])),
    );
    $srcset = explode(', ', $result['srcset']);
    $srcsetOneParts = explode(' ', $srcset[0]);
    $this->assertEquals('f_auto/c_scale,w_780/http://www.example.com/test_image.png 780w',  $this->getCloudinaryTransformationStringFromUrl($srcsetOneParts[0]) . ' ' . $srcsetOneParts[1]);
    $srcsetTwoParts = explode(' ', $srcset[1]);
    $this->assertEquals('f_auto/c_scale,w_1100/http://www.example.com/test_image.png 1100w',  $this->getCloudinaryTransformationStringFromUrl($srcsetTwoParts[0]) . ' ' . $srcsetTwoParts[1]);

    // Check the variants.
    $this->assertEquals(
      [
        'media' => '(max-width: 800px) and (orientation: portrait)',
        'width' => 800,
        'sizes' => '(max-width: 400px) 380px, (max-width: 600px) 580px, 800px'
      ],
      array_filter(array_diff_key($result['sources'][0], ['srcset' => ''])),
    );
    $variantOneSrcSet = explode(', ', $result['sources'][0]['srcset']);
    $variantOneSrcSetOneParts = explode(' ', $variantOneSrcSet[0]);
    $this->assertEquals('f_auto/c_scale,w_380/co_rgb:000000,e_colorize:60/http://www.example.com/test_image.png 380w',  $this->getCloudinaryTransformationStringFromUrl($variantOneSrcSetOneParts[0]) . ' ' . $variantOneSrcSetOneParts[1]);
    $variantOneSrcSetTwoParts = explode(' ', $variantOneSrcSet[1]);
    $this->assertEquals('f_auto/c_scale,w_580/co_rgb:000000,e_colorize:60/http://www.example.com/test_image.png 580w',  $this->getCloudinaryTransformationStringFromUrl($variantOneSrcSetTwoParts[0]) . ' ' . $variantOneSrcSetTwoParts[1]);


    $this->assertEquals(
      [
        'media' => '(max-width: 1200px) and (orientation: portrait)',
        'width' => 1200,
        'sizes' => '(max-width: 1000px) 980px, (max-width: 1100px) 1080px, 1200px'
      ],
      array_filter(array_diff_key($result['sources'][1], ['srcset' => ''])),
    );
    $variantTwoSrcSet = explode(', ', $result['sources'][1]['srcset']);
    $variantTwoSrcSetOneParts = explode(' ', $variantTwoSrcSet[0]);
    $this->assertEquals('f_auto/c_scale,w_980/co_rgb:000000,e_colorize:30/http://www.example.com/test_image.png 980w',  $this->getCloudinaryTransformationStringFromUrl($variantTwoSrcSetOneParts[0]) . ' ' . $variantTwoSrcSetOneParts[1]);
    $variantTwoSrcSetTwoParts = explode(' ', $variantTwoSrcSet[1]);
    $this->assertEquals('f_auto/c_scale,w_1080/co_rgb:000000,e_colorize:30/http://www.example.com/test_image.png 1080w',  $this->getCloudinaryTransformationStringFromUrl($variantTwoSrcSetTwoParts[0]) . ' ' . $variantTwoSrcSetTwoParts[1]);

    // Case 7. A complete test, with height calculation, sizes, variants and
    // custom transformations.
    $result = $this->executeDataProducer('responsive_image', [
      'image' => $image,
      'config' => [
        'width' => 1600,
        'height' => 1200,
        'sizes' => [
          [800, 780],
          [1200, 1100],
        ],
        'transform' => 'co_rgb:000000,e_colorize:90',
        'variants' => [
          [
            'media' => '(max-width: 800px) and (orientation: portrait)',
            'width' => 800,
            'height' => 1000,
            'sizes' => [
              [400, 380],
              [600, 580]
            ],
            'transform' => 'co_rgb:000000,e_colorize:60',
          ],
          [
            'media' => '(max-width: 1200px) and (orientation: portrait)',
            'width' => 1200,
            'height' => 1500,
            'sizes' => [
              [1000, 980],
              [1100, 1080]
            ],
            'transform' => 'co_rgb:000000,e_colorize:30',
          ]
        ],
      ],
    ]);
    $this->assertEquals('f_auto/c_fill,h_1200,w_1600/co_rgb:000000,e_colorize:90/http://www.example.com/test_image.png', $this->getCloudinaryTransformationStringFromUrl($result['src']));
    $this->assertEquals(
      [
        'width' => 1600,
        'height' => 1200,
        'sizes' => '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
      ],
      array_filter(array_diff_key($result, ['src' => '', 'srcset' => '', 'sources' => ''])),
    );
    $srcset = explode(', ', $result['srcset']);
    $srcsetOneParts = explode(' ', $srcset[0]);
    $this->assertEquals('f_auto/c_fill,h_585,w_780/co_rgb:000000,e_colorize:90/http://www.example.com/test_image.png 780w',  $this->getCloudinaryTransformationStringFromUrl($srcsetOneParts[0]) . ' ' . $srcsetOneParts[1]);
    $srcsetTwoParts = explode(' ', $srcset[1]);
    $this->assertEquals('f_auto/c_fill,h_825,w_1100/co_rgb:000000,e_colorize:90/http://www.example.com/test_image.png 1100w',  $this->getCloudinaryTransformationStringFromUrl($srcsetTwoParts[0]) . ' ' . $srcsetTwoParts[1]);

    // Check the variants.
    $this->assertEquals(
      [
        'media' => '(max-width: 800px) and (orientation: portrait)',
        'width' => 800,
        'height' => 1000,
        'sizes' => '(max-width: 400px) 380px, (max-width: 600px) 580px, 800px'
      ],
      array_filter(array_diff_key($result['sources'][0], ['srcset' => ''])),
    );
    $variantOneSrcSet = explode(', ', $result['sources'][0]['srcset']);
    $variantOneSrcSetOneParts = explode(' ', $variantOneSrcSet[0]);
    $this->assertEquals('f_auto/c_fill,h_475,w_380/co_rgb:000000,e_colorize:60/http://www.example.com/test_image.png 380w',  $this->getCloudinaryTransformationStringFromUrl($variantOneSrcSetOneParts[0]) . ' ' . $variantOneSrcSetOneParts[1]);
    $variantOneSrcSetTwoParts = explode(' ', $variantOneSrcSet[1]);
    $this->assertEquals('f_auto/c_fill,h_725,w_580/co_rgb:000000,e_colorize:60/http://www.example.com/test_image.png 580w',  $this->getCloudinaryTransformationStringFromUrl($variantOneSrcSetTwoParts[0]) . ' ' . $variantOneSrcSetTwoParts[1]);

    $this->assertEquals(
      [
        'media' => '(max-width: 1200px) and (orientation: portrait)',
        'width' => 1200,
        'height' => 1500,
        'sizes' => '(max-width: 1000px) 980px, (max-width: 1100px) 1080px, 1200px'
      ],
      array_filter(array_diff_key($result['sources'][1], ['srcset' => ''])),
    );
    $variantTwoSrcSet = explode(', ', $result['sources'][1]['srcset']);
    $variantTwoSrcSetOneParts = explode(' ', $variantTwoSrcSet[0]);
    $this->assertEquals('f_auto/c_fill,h_1225,w_980/co_rgb:000000,e_colorize:30/http://www.example.com/test_image.png 980w',  $this->getCloudinaryTransformationStringFromUrl($variantTwoSrcSetOneParts[0]) . ' ' . $variantTwoSrcSetOneParts[1]);
    $variantTwoSrcSetTwoParts = explode(' ', $variantTwoSrcSet[1]);
    $this->assertEquals('f_auto/c_fill,h_1350,w_1080/co_rgb:000000,e_colorize:30/http://www.example.com/test_image.png 1080w',  $this->getCloudinaryTransformationStringFromUrl($variantTwoSrcSetTwoParts[0]) . ' ' . $variantTwoSrcSetTwoParts[1]);
  }

  protected function getCloudinaryTransformationStringFromUrl(string $url) {
    $parsedUrl = parse_url($url);
    $pathParts = explode('/', trim($parsedUrl['path'], '/'));
    if (count($pathParts) <= 4) {
      return '';
    }
    // The first 4 components of the path we can remove, since they can have
    // variable data.
    // - cloud name
    // - image/fetch (these are 2 components)
    // - url signature.
    return implode('/', array_slice($pathParts, 4));
  }
}
