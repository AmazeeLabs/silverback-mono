<?php

namespace Drupal\silverback_gatsby;

abstract class FeedBase implements FeedInterface {
  protected string $typeName;
  protected bool $translatable;
  protected bool $diffable;

  public function __construct($typeName, $translatable, $diffable) {
    $this->typeName = $typeName;
    $this->diffable = $diffable;
    $this->translatable = $translatable;
  }

  protected function getTypeName() {
    return $this->typeName;
  }

  protected function getTranslationsTypeName() {
    return $this->translatable ? $this->getTypeName() . 'Translations' : null;
  }

  protected function getSingleFieldName() {
    return 'load' . $this->typeName;
  }

  protected function getListFieldName() {
    return 'query' . $this->typeName . 's';
  }

  protected function getChangesFieldName() {
    return 'diff' . $this->typeName . 's';
  }

  public function info(): array {
    return [
      'typeName' => $this->typeName,
      'translationsTypeName' => $this->getTranslationsTypeName(),
      'singleFieldName' => $this->getSingleFieldName(),
      'listFieldName' => $this->getListFieldName(),
      'changesFieldName' => $this->getChangesFieldName(),
    ];
  }

  public function queryFieldDefinitions(): string {
    $typeName = $this->getTranslationsTypeName() ?: $this->getTypeName();
    $singleFieldName = $this->getSingleFieldName();
    $listFieldName = $this->getListFieldName();
    $schema = [
      "  $singleFieldName(id: String!): $typeName",
      "  $listFieldName(offset: Int!, limit: Int!): [$typeName!]!",
    ];

    if ($changesFieldName = $this->getChangesFieldName()) {
      $schema[] = " $changesFieldName(since: Int!, ids: [String!]!): [Change!]!";
    }
    return implode("\n", $schema);
  }

  public function typeDefinitions(): string {
    $typeName = $this->typeName;

    $schema =  [];

    if ($translationsTypeName = $this->getTranslationsTypeName()) {
      $schema[] = "type $translationsTypeName implements Translatable {";
      $schema[] = "  id: String!";
      $schema[] = "  translations: [$typeName!]!";
      $schema[] = "}";
      $schema[] = "extend type $typeName implements Translation { langcode: String! }";
    }
    else {
      $schema[] = "extend type $typeName { id: String! }";
    }

    return implode("\n", $schema);
  }
}
