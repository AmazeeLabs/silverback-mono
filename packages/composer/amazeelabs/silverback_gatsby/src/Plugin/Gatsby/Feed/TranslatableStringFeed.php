<?php

namespace Drupal\silverback_gatsby\Plugin\Gatsby\Feed;

use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\locale\StringInterface;
use Drupal\locale\TranslationString;
use Drupal\silverback_gatsby\Plugin\FeedBase;

/**
 * Feed plugin that sources string translations into Gatsby.
 *
 * @GatsbyFeed(
 *   id = "translatableString"
 * )
 */
class TranslatableStringFeed extends FeedBase {

  /**
   * The context prefix, matching the drupal translation context.
   */
  protected string $contextPrefix;

  /**
   * {@inheritDoc}
   */
  public function __construct(
    $config,
    $plugin_id,
    $plugin_definition
  ) {
    $this->contextPrefix = $config['contextPrefix'];
    parent::__construct($config, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritDoc}
   */
  public function getUpdateIds($context, ?AccountInterface $account): array {
    if (!$context instanceof StringInterface) {
      return [];
    }

    // If the string has the 'context' property, we only return its id if it has
    // the context prefix match. If there's no context property, then we return
    // its id in any case.
    if (!isset($context->context) || empty($this->contextPrefix)) {
      return [$context->getId()];
    }
    if (strpos($context->context, $this->contextPrefix) === 0) {
      return [$context->getId()];
    }
    return [];
  }

  /**
   * {@inheritDoc}
   */
  public function isTranslatable(): bool {
    return TRUE;
  }

  /**
   * {@inheritDoc}
   */
  public function resolveId(): ResolverInterface {
    return $this->builder->produce('string_id')
      ->map('string', $this->builder->fromParent());
  }

  /**
   * {@inheritDoc}
   */
  public function resolveLangcode(): ResolverInterface {
    return $this->builder->callback(
      fn(StringInterface $value) => $value instanceof TranslationString ? $value->language : 'en'
    );
  }

  /**
   * {@inheritDoc}
   */
  public function resolveDefaultTranslation(): ResolverInterface {
    return $this->builder->callback(
      fn(StringInterface $value) => FALSE
    );
  }

  /**
   * {@inheritDoc}
   */
  public function resolveTranslations(): ResolverInterface {
    return $this->builder->produce('string_translations')
      ->map('sourceString', $this->builder->fromParent());
  }

  /**
   * {@inheritDoc}
   */
  public function resolveItems(ResolverInterface $limit, ResolverInterface $offset): ResolverInterface {
    return $this->builder->produce('list_strings')
      ->map('offset', $this->builder->defaultValue(
        $this->builder->fromArgument('offset'),
        $this->builder->fromValue(0)
      ))
      ->map('limit', $this->builder->defaultValue(
        $this->builder->fromArgument('limit'),
        $this->builder->fromValue(10),
      ))
      // For now, the schema extension does not allow array arguments. However,
      // the list strings resolver can do that, so we just convert the context
      // prefix to an array here. By doing that, when we add support for array
      // arguments in directives, we don't have to change this code.
      ->map('translationContext', $this->builder->fromValue(is_array($this->contextPrefix) ? $this->contextPrefix : [$this->contextPrefix]));
  }

  /**
   * {@inheritDoc}
   */
  public function resolveItem(ResolverInterface $id, ?ResolverInterface $langcode = NULL): ResolverInterface {
    $resolver = $this->builder->produce('fetch_translatable_string')
      ->map('id', $id)
      ->map('language', $langcode);
    return $resolver;
  }

}
