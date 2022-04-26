<?php

namespace Drupal\silverback_gatsby;

use Drupal\locale\StringContextInterface;
use Drupal\locale\StringStorageInterface;
use Drupal\silverback_gatsby\Plugin\Gatsby\Feed\StringTranslationFeed;

class LocaleStorageDecorator implements StringStorageInterface, StringContextInterface {

  /**
   * @var \Drupal\locale\StringStorageInterface
   */
  protected StringStorageInterface $subject;

  /**
   * @var \Drupal\silverback_gatsby\GatsbyUpdateHandler
   */
  protected GatsbyUpdateHandler $updateHandler;

  /**
   * @param \Drupal\locale\StringStorageInterface $subject
   *   The decorated locale storage service.
   */
  public function __construct(
    StringStorageInterface $subject
  ) {
    $this->subject = $subject;
  }

  /**
   * {@inheritDoc}
   */
  public function getStrings(array $conditions = [], array $options = []) {
    $strings = $this->subject->getStrings($conditions, $options);
    $this->updateStringsStorage($strings);
    return $strings;
  }

  /**
   * {@inheritDoc}
   */
  public function getTranslations(array $conditions = [], array $options = []) {
    $translations = $this->subject->getTranslations($conditions, $options);
    $this->updateStringsStorage($translations);
    return $translations;
  }

  /**
   * {@inheritDoc}
   */
  public function getLocations(array $conditions = []) {
    return $this->subject->getLocations($conditions);
  }

  /**
   * {@inheritDoc}
   */
  public function findString(array $conditions) {
    $string = $this->subject->findString($conditions);
    if (!empty($string)) {
      $string->setStorage($this);
    }
    return $string;
  }

  /**
   * {@inheritDoc}
   */
  public function findTranslation(array $conditions) {
    $translation = $this->subject->findTranslation($conditions);
    if (!empty($translation)) {
      $translation->setStorage($this);
    }
    return $translation;
  }

  /**
   * {@inheritDoc}
   */
  public function save($string) {
    $this->subject->save($string);
    $string->setStorage($this);
    // For now, we only track strings which have a context, for performance
    // reasons.
    if (!empty($string->context)) {
      $this->getGatsbyUpdateHandler()->handle(StringTranslationFeed::class, $string);
    }
    return $this;
  }

  /**
   * {@inheritDoc}
   */
  public function delete($string) {
    // This does not need to trigger a gatsby update handler event since it
    // seems that removing a translation (which means just setting its value to
    // nothing) triggers the save method as well.
    return $this->subject->delete($string);
  }

  /**
   * {@inheritDoc}
   */
  public function deleteStrings($conditions) {
    return $this->subject->deleteStrings($conditions);
  }

  /**
   * {@inheritDoc}
   */
  public function deleteTranslations($conditions) {
    return $this->subject->deleteTranslations($conditions);
  }

  /**
   * {@inheritDoc}
   */
  public function countStrings() {
    return $this->subject->countStrings();
  }

  /**
   * {@inheritDoc}
   */
  public function countTranslations() {
    return $this->subject->countTranslations();
  }

  /**
   * {@inheritDoc}
   */
  public function createString($values = []) {
    return $this->subject->createString($values + ['storage' => $this]);
  }

  /**
   * {@inheritDoc}
   */
  public function createTranslation($values = []) {
    return $this->subject->createTranslation($values + ['storage' => $this]);
  }

  /**
   * {@inheritDoc}
   */
  public function getContexts(): array {
    if ($this->subject instanceof StringContextInterface) {
      return $this->subject->getContexts();
    }
    return [];
  }

  /**
   * Get a gatsby update handler service. We need to instantiate this here to
   * prevent a circular dependency issue for entity_type.manager: twig ->
   * twig.extension -> date.formatter -> entity_type.manager ->
   * string_translation -> string_translator.locale.lookup -> locale.storage ->
   * silverback_gatsby.update_handler
   */
  protected function getGatsbyUpdateHandler() {
    if (!isset($this->updateHandler)) {
      $this->updateHandler = \Drupal::getContainer()->get('silverback_gatsby.update_handler');
    }
    return $this->updateHandler;
  }

  /**
   * Updates the storage reference of a set of strings.
   * @param \Drupal\locale\StringInterface[] $strings
   */
  protected function updateStringsStorage(array $strings) {
    if (!empty($strings)) {
      foreach ($strings as $string) {
        $string->setStorage($this);
      }
    }
  }
}
