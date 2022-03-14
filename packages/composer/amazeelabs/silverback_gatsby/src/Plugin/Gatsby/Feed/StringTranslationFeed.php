<?php

namespace Drupal\silverback_gatsby\Plugin\Gatsby\Feed;

use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\locale\SourceString;
use Drupal\locale\StringInterface;
use Drupal\locale\TranslationString;
use Drupal\silverback_gatsby\Plugin\FeedBase;
use GraphQL\Language\AST\DocumentNode;

/**
 * Feed plugin that creates Gatsby feeds based on Drupal string translations.
 *
 * @GatsbyFeed(
 *   id = "string_translation"
 * )
 */
class StringTranslationFeed extends FeedBase {

  /**
   * {@inheritDoc}
   */
  function getUpdateIds($context, AccountInterface $account): array {
    if ($context instanceof StringInterface) {
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
      fn(TranslationString $value) => $value->language
    );
  }

  /**
   * {@inheritDoc}
   */
  public function resolveDefaultTranslation(): ResolverInterface {
    // @todo: define the rule for a default translation.
    return $this->builder->callback(
      fn(StringInterface $value) => FALSE
    );
  }

  /**
   * {@inheritDoc}
   */
  public function resolveTranslations(): ResolverInterface {
    return $this->builder->produce('string_translations')
      ->map('string', $this->builder->fromParent());
  }

  public function resolveItems(ResolverInterface $limit, ResolverInterface $offset): ResolverInterface {
    return $this->builder->produce('list_strings')
      ->map('offset', $this->builder->defaultValue(
        $this->builder->fromArgument('offset'),
        $this->builder->fromValue(0)
      ))
      ->map('limit', $this->builder->defaultValue(
        $this->builder->fromArgument('limit'),
        $this->builder->fromValue(10),
      ));
  }

  /**
   * {@inheritDoc}
   */
  public function resolveItem(ResolverInterface $id, ?ResolverInterface $langcode = null): ResolverInterface {
    $resolver = $this->builder->produce('fetch_string')
      ->map('id', $id);
    if ($this->isTranslatable() && $langcode) {
      $resolver->map('language', $langcode);
    }
    return $resolver;
  }
}
