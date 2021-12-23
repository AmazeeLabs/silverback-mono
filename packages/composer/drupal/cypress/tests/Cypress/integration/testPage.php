<?php
use Drupal\node\Entity\Node;

/** @var object $args */

$node = Node::create([
  'type' => 'page',
  'title' => $args->title,
]);
$node->save();
echo $node->id();
