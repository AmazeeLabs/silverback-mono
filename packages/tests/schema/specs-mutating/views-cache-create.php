<?php

Drupal\node\Entity\Node::create([
  'type' => 'news',
  'title' => 'New news',
  'status' => 1,
  'langcode' => 'en',
])->save();
