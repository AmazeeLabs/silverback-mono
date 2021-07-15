<?php

namespace Drupal\silverback_external_preview;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Url;
use Drupal\path_alias\AliasManager;

/**
 * Provides some consumer preview link.
 */
class ExternalPreviewLink {

  use StringTranslationTrait;

  const PREVIEW_ENV_VARNAME = 'EXTERNAL_PREVIEW_BASE_URL';

  const LIVE_ENV_VARNAME = 'EXTERNAL_PREVIEW_LIVE_BASE_URL';

  /**
   * The consumer preview links.
   *
   * @var \Drupal\path_alias\AliasManager
   */
  protected $pathAliasManager;

  /**
   * @var \Drupal\Core\Entity\EntityTypeManager
   */
  protected $entityTypeManager;

  /**
   * @var \Drupal\Core\TempStore\PrivateTempStore
   */
  protected $tempstore;

  /**
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /** @var \Drupal\Core\Language\LanguageManager */
  protected $languageManager;

  /**
   * Controller constructor.
   *
   * @param \Drupal\path_alias\AliasManager
   *   The consumer preview links.
   */
  public function __construct(AliasManager $pathAliasManager, $entityTypeManager, $tempstore, $moduleHandler, $languageManager) {
    $this->pathAliasManager = $pathAliasManager;
    $this->entityTypeManager = $entityTypeManager;
    $this->tempstore = $tempstore;
    $this->moduleHandler = $moduleHandler;
    $this->languageManager = $languageManager;
  }


  /**
   * Returns a preview link for an entity
   *
   * @param \Drupal\Core\Routing\RouteMatchInterface $route
   *
   * @return \Drupal\Core\Url|null
   */
  public function getPreviewUrl(
    RouteMatchInterface $routeMatch
  ) {
    return $this->getExternalUrl($routeMatch, self::PREVIEW_ENV_VARNAME);
  }

  /**
   * Returns a live preview link for an entity
   *
   * @param \Drupal\Core\Routing\RouteMatchInterface $route
   *
   * @return \Drupal\Core\Url|null
   */
  public function getLiveUrl(
    RouteMatchInterface $routeMatch
  ) {
    return $this->getExternalUrl($routeMatch, self::LIVE_ENV_VARNAME);
  }

  /*
   * Returns the preview base url env variables
   * @return array|false|string|null
   */
  public function getPreviewBaseUrl() {
    return getenv(self::PREVIEW_ENV_VARNAME)
      ? rtrim(getenv(self::PREVIEW_ENV_VARNAME), '/')
      : NULL;
  }

  /**
   * Return the live base url env variable
   *
   * @return array|false|string|null
   */
  public function getLiveBaseUrl() {
    return getenv(self::LIVE_ENV_VARNAME)
      ? rtrim(getenv(self::LIVE_ENV_VARNAME), '/')
      : NULL;
  }

  /**
   * Used to create a external preview Url object for a given path
   *
   * @param string $path
   * @param string $external_url_type
   *
   * @return \Drupal\Core\Url
   */
  public function createPreviewlUrlFromPath(string $path, $external_url_type = 'preview') {
    $base_url = $external_url_type === 'preview' ? $this->getPreviewBaseUrl() : $this->getLiveBaseUrl();
    return Url::fromUri($base_url . $path, [
      'language' => $this->languageManager->getCurrentLanguage(),
      'external_url_type' => $external_url_type,
    ]);

  }

  /**
   * Returns a Url object with the concatenated base url and alias
   *
   * @param \Drupal\Core\Routing\RouteMatchInterface $route
   * @param string $envVarName
   *
   * @return \Drupal\Core\Url|null
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  protected function getExternalUrl(RouteMatchInterface $route, string $envVarName) {
    if ($base_url = getenv($envVarName)) {
      $url_object = &drupal_static(__FUNCTION__, NULL);
      if (!empty($url_object)) {
        return $url_object;
      }
      $entity = $this->getPageEntity($route);
      if ($entity instanceof EntityInterface) {
        $alias = $this->pathAliasManager->getAliasByPath($entity->toUrl()
          ->toString());

        $url = $base_url . $alias;
        $url_object = Url::fromUri($url, [
          'language' => $entity->language(),
          'external_url_type' => $envVarName === self::PREVIEW_ENV_VARNAME ? 'preview' : 'live',
        ]);
      }
      // Allow for altering the url object via a hook
      $this->moduleHandler->alter('silverback_external_preview_url', $route, $url_object);
      // Make this accessible via admin path
      $tempstore = $this->tempstore->get('silverback_external_preview');
      $tempstore->set(Url::fromRouteMatch($route)->toString(), $url_object);
    }

    return $url_object ?? NULL;
  }

  /**
   * Gets the current page main entity.
   *
   * @param \Drupal\Core\Routing\RouteMatchInterface $route
   *
   * @return array|\Drupal\Core\Entity\EntityInterface|mixed|null
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  protected function getPageEntity(RouteMatchInterface $route) {

    $params = $route->getParameters()->all();

    $types = array_keys(\Drupal::entityTypeManager()->getDefinitions());

    $page_entity = NULL;

    foreach ($types as $type) {
      if (!empty($params[$type])) {
        // Load entity if available and return it
        return $params[$type];

      }
    }

    return $page_entity;
  }

}
