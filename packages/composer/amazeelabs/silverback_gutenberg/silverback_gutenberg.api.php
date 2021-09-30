<?php

/**
 * @deprecated Use hook_silverback_gutenberg_link_processor_block_attrs_alter
 */
function hook_silverback_gutenberg_link_processor_block_attributes_alter(
  array &$attributes,
  string $blockName,
  callable $processUrlCallback
) {
  // Use hook_silverback_gutenberg_link_processor_block_attrs_alter() instead.
}

/**
 * @param array $attributes
 * @param array $context
 *   Has the following keys:
 *   - blockName: a string containing the block name
 *   - processUrlCallback: a callback to process a single URL string
 *   - processLinksCallback: a callback to process links in an HTML string
 */
function hook_silverback_gutenberg_link_processor_block_attrs_alter(array &$attributes, array $context) {
  if ($context['blockName'] === 'custom/my-links-block' && isset($attributes['urls'])) {
    $attributes['urlsUnprocessed'] = [];
    foreach ($attributes['urls'] as $key => $url) {
      $attributes['urlsUnprocessed'][$key] = $url;
      $attributes['urls'][$key] = $context['processUrlCallback']($url);
    }
  }
  if ($context['blockName'] === 'custom/my-media-block' && isset($attributes['caption'])) {
    $html = $attributes['caption'];
    $attributes['caption'] = $context['processLinksCallback']($html);
  }
}

function hook_silverback_gutenberg_link_processor_inbound_link_alter(
  \DOMElement $link,
  \Drupal\silverback_gutenberg\LinkProcessor $linkProcessor
) {
  // No idea.
}

function hook_silverback_gutenberg_link_processor_outbound_link_alter(
  \DOMElement $link,
  \Drupal\Core\Language\LanguageInterface $language,
  \Drupal\silverback_gutenberg\LinkProcessor $linkProcessor
) {
  $url = $link->getAttribute('href');
  if ($url && !$linkProcessor->linksToCurrentHost($url)) {
    $link->setAttribute('target', '_blank');
    $link->setAttribute('rel', 'noreferrer');
  }
}

function hook_silverback_gutenberg_link_processor_inbound_url_alter(
  string &$url,
  \Drupal\silverback_gutenberg\LinkProcessor $linkProcessor
) {
  // No idea.
}

function hook_silverback_gutenberg_link_processor_outbound_url_alter(
  string &$url,
  \Drupal\Core\Language\LanguageInterface $language,
  \Drupal\silverback_gutenberg\LinkProcessor $linkProcessor
) {
  if (preg_match('#^/media/([0-9]+)/edit$#', $url, $matches)) {
    // For example, turn $url into a direct file link.
  }
}
