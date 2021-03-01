<?php

namespace Drupal\test_session;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Config\ConfigFactoryOverrideInterface;
use Drupal\Core\Config\StorageInterface;
use Drupal\language\LanguageNegotiationMethodManager;

class ConfigOverrides implements ConfigFactoryOverrideInterface {

  /**
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $baseStorage;

  /**
   * @var \Drupal\language\LanguageNegotiationMethodManager|null
   */
  protected $negotiatorManager;

  public function __construct(StorageInterface $storage, LanguageNegotiationMethodManager $negotiatorManager = NULL) {
    $this->baseStorage = $storage;
    $this->negotiatorManager = $negotiatorManager;
  }

  /**
   * {@inheritdoc}
   */
  public function loadOverrides($names) {
    if (
      $this->negotiatorManager &&
      in_array('language.types', $names)
      && $this->negotiatorManager->hasDefinition('language-test-session')
      && ($config = $this->baseStorage->read('language.types'))
      && is_array($config)
    ) {
      // Enforce our language negotiation always to be on top.
      foreach (array_keys($config['negotiation']) as $type) {
        $config['negotiation'][$type]['enabled']['language-test-session'] = -999;
        asort($config['negotiation'][$type]['enabled']);
      }
      return ['language.types' => $config];
    }

    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheSuffix() {
    return 'test_session';
  }

  /**
   * {@inheritdoc}
   */
  public function createConfigObject($name, $collection = StorageInterface::DEFAULT_COLLECTION) {
    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheableMetadata($name) {
    return new CacheableMetadata();
  }

}
