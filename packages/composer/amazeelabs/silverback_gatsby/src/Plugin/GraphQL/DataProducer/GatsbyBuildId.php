<?php

namespace Drupal\silverback_gatsby\Plugin\GraphQL\DataProducer;

/**
 * @DataProducer(
 *   id = "gatsby_build_id",
 *   name = @Translation("Build the Gatsby ID "),
 *   produces = @ContextDefinition("string",
 *     label = @Translation("Gatsby ID"),
 *     multiple = TRUE,
 *   ),
 *   consumes = {
 *     "id" = @ContextDefinition("string",
 *       label = @Translation("ID"),
 *       required = TRUE,
 *     ),
 *     "langcode" = @ContextDefinition("string",
 *       label = @Translation("Langcode"),
 *       required = TRUE,
 *     )
 *   },
 * )
 */
class GatsbyBuildId extends EntityQueryBase {

  public static function build(string $id, string $langcode) {
    return $id . ':' . $langcode;
  }

  public function resolve(string $id, string $langcode) {
    return static::build($id, $langcode);
  }
}
