<?php

namespace Drupal\Tests\silverback_cloudinary\Kernel\DataProducer;

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
  public function testResponsiveImage($image, $config, $expected): void
  {
    $result = $this->executeDataProducer('responsive_image', [
      'image' => $image,
      'config' => $config,
    ]);
    $this->assertEquals($expected, $result);
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
        'image' => $image,
        'config' => NULL,
        'expected' => ['src' => $image]
      ],
      // Case 2. Only ask for a width (so just scale the image).
      [
        'image' => $image,
        'config' => [
          'width' => 600,
        ],
        'expected' => [
          'width' => 600,
          'src' => $cloudinaryFetchUrl . '/s--mMcf9g3W--/f_auto/c_scale,w_600/' . $image,
        ]
      ],
      // Case 3. Ask for a width and height.
      [
        'image' => $image,
        'config' => [
          'width' => 600,
          'height' => 400,
        ],
        'expected' => [
          'width' => 600,
          'height' => 400,
          'src' => $cloudinaryFetchUrl . '/s--QmPjqg1S--/f_auto/c_fill,h_400,w_600/' . $image,
        ]
      ],
      // Case 4. Ask for a custom transformation.
      [
        'image' => $image,
        'config' => [
          'width' => 600,
          'height' => 400,
          'transform' => 'c_lfill,h_150,w_150',
        ],
        'expected' => [
          'width' => 600,
          'height' => 400,
          'src' => $cloudinaryFetchUrl . '/s--qWenXwR1--/f_auto/c_fill,h_400,w_600/c_lfill,h_150,w_150/' . $image
        ]
      ],
      // Case 5. Ask for sizes.
      [
        'image' => $image,
        'config' => [
          'width' => 1600,
          'sizes' => [
            [800, 780],
            [1200, 1100],
          ],
        ],
        'expected' => [
          'src' => $cloudinaryFetchUrl . '/s--aDf84wZ---/f_auto/c_scale,w_1600/' . $image,
          'width' => 1600,
          'sizes' => '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
          'srcset' => implode(', ', [
            $cloudinaryFetchUrl . '/s--9R_Nlnad--/f_auto/c_scale,w_780/' . $image . ' 780w',
            $cloudinaryFetchUrl . '/s--tNMhIIt8--/f_auto/c_scale,w_1100/' . $image . ' 1100w',
          ])
        ]
      ],
      // Case 6. Ask for variants, no height, only the width.
      [
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
        'expected' => [
          'src' => $cloudinaryFetchUrl . '/s--aDf84wZ---/f_auto/c_scale,w_1600/' . $image,
          'width' => 1600,
          'sizes' => '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
          'srcset' => implode(', ', [
            $cloudinaryFetchUrl . '/s--9R_Nlnad--/f_auto/c_scale,w_780/' . $image . ' 780w',
            $cloudinaryFetchUrl . '/s--tNMhIIt8--/f_auto/c_scale,w_1100/' . $image . ' 1100w',
          ]),
          'sources' => [
            [
              'media' => '(max-width: 800px) and (orientation: portrait)',
              'width' => 800,
              'sizes' => '(max-width: 400px) 380px, (max-width: 600px) 580px, 800px',
              'srcset' => implode(', ', [
                $cloudinaryFetchUrl . '/s--iEXyKcRd--/f_auto/c_scale,w_380/co_rgb:000000,e_colorize:60/' . $image . ' 380w',
                $cloudinaryFetchUrl . '/s--nLdDPUc7--/f_auto/c_scale,w_580/co_rgb:000000,e_colorize:60/' . $image . ' 580w',
              ]),
            ],
            [
              'media' => '(max-width: 1200px) and (orientation: portrait)',
              'width' => 1200,
              'sizes' => '(max-width: 1000px) 980px, (max-width: 1100px) 1080px, 1200px',
              'srcset' => implode(', ', [
                $cloudinaryFetchUrl . '/s--LG2eSHZy--/f_auto/c_scale,w_980/co_rgb:000000,e_colorize:30/' . $image . ' 980w',
                $cloudinaryFetchUrl . '/s--dwGp0r6v--/f_auto/c_scale,w_1080/co_rgb:000000,e_colorize:30/' . $image .' 1080w',
              ]),
            ],
          ],
        ]
      ],
      // Case 7. A complete test, with height calculation, sizes, variants and
      // custom transformations.
      [
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
        'expected' => [
          'src' => $cloudinaryFetchUrl . '/s--HajkvDOl--/f_auto/c_fill,h_1200,w_1600/co_rgb:000000,e_colorize:90/' . $image,
          'width' => 1600,
          'height' => 1200,
          'sizes' => '(max-width: 800px) 780px, (max-width: 1200px) 1100px, 1600px',
          'srcset' => implode(', ', [
            $cloudinaryFetchUrl . '/s--LrbguHed--/f_auto/c_fill,h_585,w_780/co_rgb:000000,e_colorize:90/' . $image . ' 780w',
            $cloudinaryFetchUrl . '/s--NrLexxyx--/f_auto/c_fill,h_825,w_1100/co_rgb:000000,e_colorize:90/' . $image . ' 1100w',
          ]),
          'sources' => [
            [
              'media' => '(max-width: 800px) and (orientation: portrait)',
              'width' => 800,
              'height' => 1000,
              'sizes' => '(max-width: 400px) 380px, (max-width: 600px) 580px, 800px',
              'srcset' => implode(', ', [
                $cloudinaryFetchUrl . '/s--rFTn2kdY--/f_auto/c_fill,h_475,w_380/co_rgb:000000,e_colorize:60/' . $image . ' 380w',
                $cloudinaryFetchUrl . '/s--N5VnQ0XM--/f_auto/c_fill,h_725,w_580/co_rgb:000000,e_colorize:60/' . $image . ' 580w',
              ]),
            ],
            [
              'media' => '(max-width: 1200px) and (orientation: portrait)',
              'width' => 1200,
              'height' => 1500,
              'sizes' => '(max-width: 1000px) 980px, (max-width: 1100px) 1080px, 1200px',
              'srcset' => implode(', ', [
                $cloudinaryFetchUrl . '/s--6tB__bYy--/f_auto/c_fill,h_1225,w_980/co_rgb:000000,e_colorize:30/' . $image  .' 980w',
                $cloudinaryFetchUrl . '/s--ItybU5RI--/f_auto/c_fill,h_1350,w_1080/co_rgb:000000,e_colorize:30/' . $image . ' 1080w',
              ]),
            ],
          ],
        ]
      ],
    ];
  }
}
