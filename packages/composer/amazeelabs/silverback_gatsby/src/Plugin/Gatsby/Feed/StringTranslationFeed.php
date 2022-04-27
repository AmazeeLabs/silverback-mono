<?php

namespace Drupal\silverback_gatsby\Plugin\Gatsby\Feed;

use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\locale\SourceString;
use Drupal\locale\StringInterface;
use Drupal\locale\TranslationString;
use Drupal\silverback_gatsby\Plugin\FeedBase;
use GraphQL\Language\AST\DocumentNode;

/**
 * Feed plugin that creates Gatsby feeds based on Drupal string translations.
 *
 * @GatsbyFeed(
 *   id = "stringTranslation"
 * )
 */
class StringTranslationFeed extends FeedBase {

  protected $contextPrefix;

  public function __construct(
    $config,
    $plugin_id,
    $plugin_definition
  ) {
    $this->contextPrefix = $config['contextPrefix'];
    parent::__construct($config, $plugin_id, $plugin_definition);
  }

  public function getTranslationTypeName() {
    return $this->getTypeName() . 'Translation';
  }

  /**
   * {@inheritDoc}
   */
  function getUpdateIds($context, AccountInterface $account): array {
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
    return FALSE;
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
      fn(StringInterface $value) => $value instanceof TranslationString ? $value->language : ''
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
  public function resolveItem(ResolverInterface $id, ?ResolverInterface $langcode = null): ResolverInterface {
    $resolver = $this->builder->produce('fetch_string')
      ->map('id', $id);
    return $resolver;
  }

  public function getExtensionDefinition(DocumentNode $parentAst): string {
    $typeName = $this->getTypeName();
    $translationTypeName = $this->getTranslationTypeName();
    $def = [];
    $def[] = "extend type $typeName {";
    $def[] = "  source: String!";
    $def[] = "  context: String";
    $def[] = "  translations: [$translationTypeName]";
    $def[] = "}";
    $def[] = "type $translationTypeName {";
    $def[] = "  id: String!";
    $def[] = "  source: String!";
    $def[] = "  langcode: String!";
    $def[] = "  translation: String!";
    $def[] = "}";
    return implode("\n", $def);
  }

  public function addExtensionResolvers(
    ResolverRegistryInterface $registry,
    ResolverBuilder $builder
  ): void {
    $registry->addFieldResolver($this->getTypeName(), 'source', $builder->callback(
      fn (StringInterface $value) => $value->getString()
    ));
    $registry->addFieldResolver($this->getTypeName(), 'context', $builder->callback(
      fn (StringInterface $value) => $value->context ?? ''
    ));
    $registry->addFieldResolver($this->getTypeName(), 'translations', $this->resolveTranslations());

    $translationTypeName = $this->getTranslationTypeName();
    $registry->addFieldResolver($translationTypeName, 'id', $builder->produce('gatsby_build_id')
      ->map('id', $this->resolveId())
      ->map('langcode', $this->resolveLangcode()));
    $registry->addFieldResolver($translationTypeName, 'source', $builder->callback(
      fn (StringInterface $value) => $value->source
    ));
    $registry->addFieldResolver($translationTypeName, 'langcode', $this->resolveLangcode());
    $registry->addFieldResolver($translationTypeName, 'translation', $builder->callback(
      fn (StringInterface $value) => $value->getString()
    ));
  }
}
