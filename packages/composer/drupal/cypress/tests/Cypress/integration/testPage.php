<?php
use Drupal\node\Entity\Node;

/** @var object $args */
// https://github.com/phpstan/phpstan/issues/3515
assert($args instanceof \stdClass);

$node = Node::create([
  'type' => 'page',
  'title' => $args->title,
]);
$node->save();
echo $node->id();
