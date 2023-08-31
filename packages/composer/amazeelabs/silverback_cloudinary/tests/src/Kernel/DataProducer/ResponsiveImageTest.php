<?php

namespace Drupal\Tests\silverback_cloudinary\Kernel\DataProducer;

use Drupal\Component\Serialization\Json;
use Drupal\Tests\graphql\Kernel\GraphQLTestBase;

class ResponsiveImageTest extends GraphQLTestBase {

  protected static $modules = ['silverback_cloudinary'];

  protected $cloudinaryCloudName = 'demo';

  protected $cloudinaryResourceBaseUrl = 'https://res.cloudinary.com';

  /**
   * {@inheritDoc}
   */
  public function setUp(): void {
    parent::setUp();
    putenv('CLOUDINARY_URL=cloudinary://test:test@' . $this->cloudinaryCloudName);
  }

  /**
   * @covers \Drupal\silverback_cloudinary\Plugin\GraphQL\DataProducer\ResponsiveImage::resolve
   * @dataProvider responsiveImageProvider
   */
  public function testResponsiveImage($image, $expected, $width = NULL, $height = NULL, $sizes = NULL, $transform = NULL): void {
    $result = $this->executeDataProducer('responsive_image', [
      'image' => $image,
      'width' => $width,
      'height' => $height,
      'sizes' => $sizes,
      'transform' => $transform,
    ]);
    $this->assertEquals($expected, Json::decode($result));
  }

  /**
   * Data provider for testResponsiveImage
   * @return array[]
   */
  public function responsiveImageProvider() {
    $image = 'http://www.example.com/test_image.png';
    $cloudinaryFetchUrl = $this->cloudinaryResourceBaseUrl . '/' . $this->cloudinaryCloudName . '/image/fetch';
    return [
      // Case 1. No config parameter sent.
      [
        'image' => ['src' => $image, 'width' => 100, 'height' => 100],
        'expected' => ['src' => $image, 'width' => 100, 'height' => 100]
      ],
      // Case 2. Only ask for a width (so just scale the image).
      [
        'image' => ['src' => $image, 'width' => 1000, 'height' => 500],
        'expected' => [
          'originalSrc' => $image,
          'width' => 600,
          'height' => 300,
          'src' => $cloudinaryFetchUrl . '/s--1SSv3TAe--/f_auto/q_auto/c_scale,w_600/' . $image,
        ],
        'width' => 600,
      ],
      // Case 3. Ask for a width and height.
      [
        'image' => ['src' => $image, 'width' => 1000, 'height' => 1000],
        'expected' => [
          'originalSrc' => $image,
          'width' => 600,
          'height' => 400,
          'src' => $cloudinaryFetchUrl . '/s--oQnrp4QO--/f_auto/q_auto/c_fill,g_auto,h_400,w_600/' . $image,
        ],
        'width' => 600,
        'height' => 400,
      ],
      // Case 4. Ask for a custom transformation.
      [
        'image' => ['src' => $image, 'width' => 1000, 'height' => 1000],
        'expected' => [
          'originalSrc' => $image,
          'width' => 600,
          'height' => 400,
          'src' => $cloudinaryFetchUrl . '/s--iBYmBJnf--/f_auto/q_auto/c_fill,g_auto,h_400,w_600/c_lfill,h_150,w_150/' . $image
        ],
        'width' => 600,
        'height' => 400,
        'sizes' => NULL,
        'transform' => 'c_lfill,h_150,w_150',
      ],
      // Case 5. Ask for sizes.
      [
        'image' => ['src' => $image, 'width' => 2000, 'height' => 1600],
        'expected' => [
          'originalSrc' => $image,
          'src' => $cloudinaryFetchUrl . '/s--do7-bAD9--/f_auto/q_auto/c_scale,w_1600/' . $image,
          'width' => 1600,
          'height' => 1280,
          'sizes' => '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
          'srcset' => implode(', ', [
            $cloudinaryFetchUrl . '/s--MZkCHWuY--/f_auto/q_auto/c_scale,w_780/' . $image . ' 780w',
            $cloudinaryFetchUrl . '/s--xlf_u2mA--/f_auto/q_auto/c_scale,w_1100/' . $image . ' 1100w',
          ])
        ],
        'width' => 1600,
        'height' => NULL,
        'sizes' => [
          [800, 780],
          [1200, 1100],
        ],
      ],
      // Case 6. A complete test, with height calculation, sizes and custom
      // transformations.
      [
        'image' => ['src' => $image, 'width' => 2000, 'height' => 1600],
        'expected' => [
          'originalSrc' => $image,
          'src' => $cloudinaryFetchUrl . '/s--PYehk6Pp--/f_auto/q_auto/c_fill,g_auto,h_1200,w_1600/co_rgb:000000,e_colorize:90/' . $image,
          'width' => 1600,
          'height' => 1200,
          'sizes' => '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
          'srcset' => implode(', ', [
            $cloudinaryFetchUrl . '/s--0q-v7sf8--/f_auto/q_auto/c_fill,g_auto,h_585,w_780/co_rgb:000000,e_colorize:90/' . $image . ' 780w',
            $cloudinaryFetchUrl . '/s--1PnC9sUX--/f_auto/q_auto/c_fill,g_auto,h_825,w_1100/co_rgb:000000,e_colorize:90/' . $image . ' 1100w',
          ]),
        ],
        'width' => 1600,
        'height' => 1200,
        'sizes' => [
          [800, 780],
          [1200, 1100],
        ],
        'transform' => 'co_rgb:000000,e_colorize:90',
      ],
    ];
  }
}