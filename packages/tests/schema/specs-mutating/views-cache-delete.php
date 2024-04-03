<?php

$nodes = \Drupal::entityTypeManager()
  ->getStorage('node')
  ->loadByProperties(['type' => 'news', 'title' => 'News translated']);
reset($nodes)->delete();
