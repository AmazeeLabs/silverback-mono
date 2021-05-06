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

  protected function getTranslationTypeName() {
    return $this->translatable ? $this->getTypeName() . 'Translation' : null;
  }

  protected function getSingleFieldName() {
    return implode('__', array_filter([$this->id()]));
  }

  protected function getListFieldName() {
    return implode('__', array_filter([$this->id(), 'list']));
  }

  protected function getChangesFieldName() {
    return $this->diffable ? implode('__', array_filter([$this->id(), 'changes'])) : null;
  }

  public function info(): array {
    return [
      'typeName' => $this->typeName,
      'translationTypeName' => $this->getTranslationTypeName(),
      'singleFieldName' => $this->getSingleFieldName(),
      'listFieldName' => $this->getListFieldName(),
      'changesFieldName' => $this->getChangesFieldName(),
    ];
  }

  public function queryFieldDefinitions(): string {
    $typeName = $this->getTypeName();
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

    if ($translationTypeName = $this->getTranslationTypeName()) {
      $schema[] = "type $typeName implements Translatable {";
      $schema[] = "  id: String!";
      $schema[] = "  translations: [$translationTypeName!]!";
      $schema[] = "}";
      $schema[] = "type $translationTypeName implements Translation { langcode: String! }";
    }
    else {
      $schema[] = "type $typeName { id: String! }";
    }

    return implode("\n", $schema);
  }
}
