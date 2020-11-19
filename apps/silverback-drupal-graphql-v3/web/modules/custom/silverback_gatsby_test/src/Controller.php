<?php

namespace Drupal\silverback_gatsby_test;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class Controller {

  public function nodeOp(Request $request) {
    $nodeStorage = \Drupal::entityTypeManager()->getStorage('node');
    $data = json_decode($request->getContent(), TRUE);
    if ($data['op'] === 'delete') {
      $node = $nodeStorage->load($data['node']['nid']);
      $nodeStorage->delete([$node]);
      return new Response();
    }
    if ($data['op'] === 'update') {
      $node = $nodeStorage->load($data['node']['nid']);
      foreach ($data['node'] as $field => $value) {
        $node->{$field} = $value;
      }
    }
    else {
      $node = $nodeStorage->create($data['node']);
    }
    $node->save();
    return new Response(json_encode($node->toArray()));
  }

}
