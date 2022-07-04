<?php

namespace Drupal\silverback_external_preview;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\RevisionableStorageInterface;
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
   * Returns the preview base url from the env variable.
   *
   * @return string
   * @throws \Exception
   */
  public function getPreviewBaseUrl() {
    if (getenv(self::PREVIEW_ENV_VARNAME)) {
      return rtrim(getenv(self::PREVIEW_ENV_VARNAME), '/');
    }
    else {
      throw new \Exception(self::PREVIEW_ENV_VARNAME  . ' environment variable is not set.');
    }
  }

  /*
   * Returns the live base url from the env variable.
   *
   * @return string
   * @throws \Exception
   */
  public function getLiveBaseUrl() {
    if (getenv(self::LIVE_ENV_VARNAME)) {
      return rtrim(getenv(self::LIVE_ENV_VARNAME), '/');
    }
    else {
      throw new \Exception(self::LIVE_ENV_VARNAME  . ' environment variable is not set.');
    }
  }

  /**
   * Used to create a external Url object for a given path.
   *
   * @param string $path
   * @param string $external_url_type
   *
   * @return \Drupal\Core\Url
   */
  public function createPreviewUrlFromPath(string $path, $external_url_type = 'preview') {
    $base_url = $external_url_type === 'preview' ? $this->getPreviewBaseUrl() : $this->getLiveBaseUrl();
    return Url::fromUri($base_url . $path, $this->getUrlOptions($external_url_type));
  }

  /**
   * Used to create a external Url object for a given content entity.
   *
   * @param ContentEntityInterface $entity
   * @param string $external_url_type
   *
   * @return \Drupal\Core\Url|null
   */
  public function createPreviewUrlFromEntity(ContentEntityInterface $entity, $external_url_type = 'preview') {
    if ($this->isNodeRevisionRoute()) {
      return $this->getRevisionPreviewUrl($entity);
    }
    else {
      $base_url = $external_url_type === 'preview' ? $this->getPreviewBaseUrl() : $this->getLiveBaseUrl();
      $path = $entity->toUrl('canonical')->toString(TRUE)->getGeneratedUrl();
      return Url::fromUri($base_url . $path, $this->getUrlOptions($external_url_type, $entity));
    }
  }

  public function isNodeRevisionRoute() {
    $route_name = \Drupal::routeMatch()->getRouteName();
    $node_revision_routes = [
      'entity.node.revision',
      'entity.node.latest_version',
    ];
    return in_array($route_name, $node_revision_routes);
  }

  private function getRevisionPreviewUrl(ContentEntityInterface $entity) {
    $entity_type_id = $entity->getEntityTypeId();
    $storage = $this->entityTypeManager->getStorage($entity_type_id);
    if (!$storage instanceof RevisionableStorageInterface) {
      throw new \Exception('Entity type ' . $entity->getEntityTypeId() . ' is not revisionable.');
    }

    $route_match = \Drupal::routeMatch();
    if ($route_match->getRouteName() === 'entity.node.revision') {
      /** @var \Drupal\node\NodeInterface $node_revision */
      $revision = $route_match->getParameter('node_revision');
      $revision_id = $revision->getRevisionId();
    }
    elseif ($route_match->getRouteName() === 'entity.node.latest_version') {
      $revision_id = $storage->getLatestRevisionId($entity->id());
    }
    else {
      throw new \Exception('Only node routes are currently supported for revision preview url.');
    }

    return Url::fromUri(
      $this->getPreviewBaseUrl() . '/__preview/' . $entity->bundle(),
      [
        'query' => [
          'id' => $entity->id(),
          'revision' => $revision_id,
        ]
      ]
    );
  }

  private function getUrlOptions($external_url_type = 'preview', ContentEntityInterface $entity = NULL) {
    $result = [
      'language' => $entity instanceof ContentEntityInterface ? $entity->language() : $this->languageManager->getCurrentLanguage(),
      'external_url_type' => $external_url_type,
    ];
    if ($external_url_type === 'preview') {
      $result['query'] = [
        'preview' => 1,
      ];
    }
    return $result;
  }

  /**
   * Returns a Url object with the concatenated base url and alias.
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
      // At the moment we support only content entity types. Because there was
      // an error on the field edit routes (e.g. on
      // "/admin/structure/types/manage/foo/fields/node.foo.field_bar"):
      // No link template 'edit-form' found for the 'field_config' entity type
      if ($entity instanceof ContentEntityInterface) {
        $alias = $this->pathAliasManager->getAliasByPath($entity->toUrl()
          ->toString());

        $url = $base_url . $alias;
        $external_url_type = self::PREVIEW_ENV_VARNAME ? 'preview' : 'live';
        $options = $this->getUrlOptions($external_url_type, $entity);
        $url_object = Url::fromUri($url, $options);
        $id = $entity->getEntityTypeId() . ':' . $entity->id() . ':'. $entity->get('langcode')->value;
        // Make this accessible via admin path
        $tempstore = $this->tempstore->get('silverback_external_preview');
        $tempstore->set($id, $url_object);
      }
      // Allow for altering the url object via a hook
      $this->moduleHandler->alter('silverback_external_preview_url', $route, $url_object);
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
