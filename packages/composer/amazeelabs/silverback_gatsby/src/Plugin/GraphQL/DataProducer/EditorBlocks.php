<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Render\BubbleableMetadata;
use Drupal\Core\Render\RenderContext;
use Drupal\Core\TypedData\Exception\MissingDataException;
use Drupal\Core\TypedData\TypedDataInterface;
use Drupal\Core\TypedData\TypedDataTrait;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\gutenberg\Parser\BlockParser;
use Drupal\silverback_gutenberg\LinkProcessor;
use Drupal\typed_data\DataFetcherTrait;
use Drupal\typed_data\Exception\InvalidArgumentException;
use Drupal\typed_data\Exception\LogicException;


/**
 * Resolves a typed data value at a given property path and parses it to blocks.
 *
 * @DataProducer(
 *   id = "editor_blocks",
 *   name = @Translation("Editor blocks"),
 *   description = @Translation("Resolve html content from a property path and parse it into blocks."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("List of Blocks")
 *   ),
 *   consumes = {
 *     "path" = @ContextDefinition("string",
 *       label = @Translation("Property path")
 *     ),
 *     "entity" = @ContextDefinition("any",
 *       label = @Translation("Root value")
 *     ),
 *     "type" = @ContextDefinition("string",
 *       label = @Translation("Root type"),
 *       required = FALSE
 *     )
 *   }
 * )
 */
class EditorBlocks extends DataProducerPluginBase {
  use TypedDataTrait;
  use DataFetcherTrait;

  public function resolve(
    $path,
    $entity,
    $type,
    FieldContext $field
  ) {
    if (!$entity instanceof EntityInterface) {
      throw new LogicException('Editor blocks can only be retrieved from Entities');
    }
    $field->setContextLanguage($entity->language()->getId());
    if (!($entity instanceof TypedDataInterface) && !empty($type)) {
      $manager = $this->getTypedDataManager();
      $definition = $manager->createDataDefinition($type);
      $value = $manager->create($definition, $entity);
    }

    if (!($value instanceof TypedDataInterface)) {
      throw new \BadMethodCallException('Could not derive typed data type.');
    }

    $bubbleable = new BubbleableMetadata();
    $fetcher = $this->getDataFetcher();

    try {
      $html = $fetcher->fetchDataByPropertyPath($value, $path, $bubbleable)->getValue();
    }
    catch (MissingDataException $exception) {
      // There is no data at the given path.
    }
    catch (InvalidArgumentException $exception) {
      // The path is invalid for the source object.
    }
    finally {
      $field->addCacheableDependency($bubbleable);
    }

    $linkProcessor = \Drupal::service(LinkProcessor::class);

    $context = new RenderContext();
    $result = \Drupal::service('renderer')->executeInRenderContext(
      $context,
      function () use ($entity, $field, $html, $linkProcessor) {
        $parser = new BlockParser();
        $html = $linkProcessor->processLinks($html, 'outbound', $entity->language());
        return $parser->parse($html);
      }
    );
    if (!$context->isEmpty()) {
      $field->addCacheableDependency($context->pop());
    }
    return $result;
  }

}
