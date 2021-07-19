<?php

namespace Drupal\silverback_gutenberg;

/**
 * Class BlockSerializer
 *
 * Copied from:
 * https://core.trac.wordpress.org/browser/tags/5.3.1/src/wp-includes/blocks.php#L226
 *
 * @package Drupal\silverback_gutenberg
 */
class BlockSerializer {

  public function serialize_blocks( $blocks ) {
    return implode( '', array_map( fn ($block) => $this->serialize_block($block), $blocks ) );
  }

  protected function serialize_block( $block ) {
    $block_content = '';

    $index = 0;
    foreach ( $block['innerContent'] as $chunk ) {
      $block_content .= is_string( $chunk ) ? $chunk : $this->serialize_block( $block['innerBlocks'][ $index++ ] );
    }

    if ( ! is_array( $block['attrs'] ) ) {
      $block['attrs'] = array();
    }

    return $this->get_comment_delimited_block_content(
      $block['blockName'],
      $block['attrs'],
      $block_content
    );
  }

  protected function get_comment_delimited_block_content($block_name = null, $block_attributes = null, $block_content = '') {
    if ( is_null( $block_name ) ) {
      return $block_content;
    }

    $serialized_block_name = $this->strip_core_block_namespace(
      $block_name
    );
    $serialized_attributes = empty( $block_attributes ) ? '' : $this->serialize_block_attributes(
        $block_attributes
      ) . ' ';

    if ( empty( $block_content ) ) {
      return sprintf( '<!-- wp:%s %s/-->', $serialized_block_name, $serialized_attributes );
    }

    return sprintf(
      '<!-- wp:%s %s-->%s<!-- /wp:%s -->',
      $serialized_block_name,
      $serialized_attributes,
      $block_content,
      $serialized_block_name
    );
  }

  protected function strip_core_block_namespace( $block_name = null ) {
    if ( is_string( $block_name ) && 0 === strpos( $block_name, 'core/' ) ) {
      return substr( $block_name, 5 );
    }

    return $block_name;
  }


  protected function serialize_block_attributes( $block_attributes ) {
    // TODO: Original wordpress serializer does not unescape slashes.
    $encoded_attributes = json_encode( $block_attributes, JSON_UNESCAPED_SLASHES );
    $encoded_attributes = preg_replace( '/--/', '\\u002d\\u002d', $encoded_attributes );
    $encoded_attributes = preg_replace( '/</', '\\u003c', $encoded_attributes );
    $encoded_attributes = preg_replace( '/>/', '\\u003e', $encoded_attributes );
    $encoded_attributes = preg_replace( '/&/', '\\u0026', $encoded_attributes );
    // Regex: /\\"/
    $encoded_attributes = preg_replace( '/\\\\"/', '\\u0022', $encoded_attributes );

    return $encoded_attributes;
  }
}
