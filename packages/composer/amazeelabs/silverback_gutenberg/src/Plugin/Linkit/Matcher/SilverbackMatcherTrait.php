<?php

namespace Drupal\silverback_gutenberg\Plugin\Linkit\Matcher;

use Drupal\Component\Utility\Html;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\TranslatableInterface;
use Drupal\linkit\Suggestion\SuggestionCollection;

trait SilverbackMatcherTrait {

  protected string $searchStringLowercase = '';

  protected array $labelsToSortLowercase = [];

  public function execute($string) {
    $this->searchStringLowercase = mb_strtolower($string);

    $suggestions = parent::execute($string)->getSuggestions();

    // Sort suggestions by the position of the search string in the label.
    uasort($this->labelsToSortLowercase, function ($a, $b) {
      $aPos = strpos($a, $this->searchStringLowercase);
      $bPos = strpos($b, $this->searchStringLowercase);
      if ($aPos === $bPos) {
        return 0;
      }
      return ($aPos < $bPos) ? -1 : 1;
    });
    // Reorder suggestions according to the sorted labels.
    $suggestions = array_values(array_replace($this->labelsToSortLowercase, $suggestions));

    $new = new SuggestionCollection();
    foreach ($suggestions as $suggestion) {
      $new->addSuggestion($suggestion);
    }
    return $new;
  }

  protected function buildLabel(EntityInterface $entity) {
    // Entity query searches through all node translations, but the linkit node
    // matcher prints only one translation (current language) in the
    // suggestions. This can lead to a confusion because a suggestion can
    // contain no input string.
    // For such cases we redo the suggestion label to the following form:
    // "<label in current language> (<translation that matches the input string>)"
    // Additionally, we collect labels matching the input string to use for
    // sorting later.

    $label = (string) $entity->label();
    if (str_contains(mb_strtolower($label), $this->searchStringLowercase)) {
      $this->labelsToSortLowercase[] = mb_strtolower($label);
      return Html::escape($label);
    }
    if ($entity instanceof TranslatableInterface && $entity->isTranslatable()) {
      foreach ($entity->getTranslationLanguages() as $language) {
        $translation = $entity->getTranslation($language->getId());
        $translatedLabel = (string) $translation->label();
        if (str_contains(mb_strtolower($translatedLabel), $this->searchStringLowercase)) {
          $this->labelsToSortLowercase[] = mb_strtolower($translatedLabel);
          return Html::escape("{$label} ({$translatedLabel})");
        }
      }
    }
    $this->labelsToSortLowercase[] = mb_strtolower($label);
    return Html::escape($label);
  }

}
