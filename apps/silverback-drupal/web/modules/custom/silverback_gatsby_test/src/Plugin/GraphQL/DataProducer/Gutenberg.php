<?php

namespace Drupal\silverback_gatsby_test\Plugin\GraphQL\DataProducer;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\gutenberg\Parser\BlockParser;
use Drupal\media\Entity\Media;

/**
 * @DataProducer(
 *   id = "gutenberg",
 *   name = @Translation("Gutenberg"),
 *   description = @Translation("Parsed Gutenberg data."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Array of content blocks")
 *   ),
 *   consumes = {
 *     "entity" = @ContextDefinition("entity",
 *       label = @Translation("Entity")
 *     )
 *   }
 * )
 */
class Gutenberg extends DataProducerPluginBase
{

  public function resolve(ContentEntityInterface $entity): array
  {
    $parser = new BlockParser();
    $blocks = $parser->parse($entity->get('body')->value);
    return $this->transform($blocks);
  }

  protected function transform(array $blocks): array
  {
    $result = [];

    foreach ($blocks as $block) {
      switch ($block['blockName']) {

        case NULL:
          break;

        case 'core/paragraph':
        case 'core/list':
        case 'core/quote':
        $result[] = [
            '__type' => 'BlockHtml',
            'html' => $this->processHtml($block['innerHTML']),
          ];
          break;

        case 'drupalmedia/drupal-media-entity':
          // In real project: would be nice to catch potential exceptions here.
          $media = Media::load($block['attrs']['mediaEntityIds'][0]);
          $bundle = $media->bundle();
          switch ($bundle) {
            case 'image':
              $result[] = [
                '__type' => 'BlockImage',
                'caption' => trim($block['attrs']['caption']),
                'image' => $media,
              ];
              break;

            default:
              throw new \Exception("Unknown media type: '{$bundle}'");
          }
          break;

        case 'core/group':
        case 'custom/root':
          // Groups and Root add nothing to the layout.
          $result = array_merge($result, $this->transform($block['innerBlocks']));
          break;

        case 'custom/two-columns':
          $result[] = [
            '__type' => 'BlockTwoColumns',
            'children' => $this->transform(
              // Skip core/columns block.
              $block['innerBlocks'][0]['innerBlocks']
            ),
          ];
          break;

        case 'core/column':
          $result[] = [
            '__type' => 'BlockColumn',
            'children' => $this->transform($block['innerBlocks']),
          ];
          break;

        case 'custom/teaser':
          $media = Media::load($block['attrs']['mediaEntityIds'][0]);
          $bundle = $media->bundle();
          if ($bundle !== 'image') {
            throw new \Exception("Teaser only supports image media. Given media type: '{$bundle}'");
          }
          $result[] = [
            '__type' => 'BlockTeaser',
            'image' => $media,
            'title' => trim($block['attrs']['title']),
            'subtitle' => trim($block['attrs']['subtitle']),
            // TODO (gutenberg): process URL.
            'url' => trim($block['attrs']['url']),
          ];
          break;

        default:
          throw new \Exception("Unknown block type: '{$block['blockName']}'");
      }
    }
    return $result;
  }

  protected function processHtml(string $html): string {
    // TODO (gutenberg):
    //  - parse and fix link URLs
    //  - correct faulty HTML
    //  - filter XSS
    return trim($html);
  }

}
