<?php

namespace Drupal\silverback_gutenberg\Plugin\Linkit\Matcher;

use Drupal\linkit\Plugin\Linkit\Matcher\NodeMatcher;

/**
 * @Matcher(
 *   id = "silverback:entity:node",
 *   label = @Translation("Silverback: Content"),
 *   target_entity = "node",
 *   provider = "node"
 * )
 */
class SilverbackNodeMatcher extends NodeMatcher {

  use SilverbackMatcherTrait;

}
