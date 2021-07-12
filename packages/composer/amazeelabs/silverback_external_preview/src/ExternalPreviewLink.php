<?php

namespace Drupal\silverback_external_preview;

use Drupal\Core\Entity\EntityInterface;
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
   * Controller constructor.
   *
   * @param \Drupal\path_alias\AliasManager
   *   The consumer preview links.
   */
  public function __construct(AliasManager $pathAliasManager) {
    $this->pathAliasManager = $pathAliasManager;
  }

  /**
   * Returns a preview link for an entity
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *
   * @return \Drupal\Core\Link
   */
  public function getPreviewUrl(
    EntityInterface $entity
  ) {
    return $this->getExternalUrl($entity, self::PREVIEW_ENV_VARNAME);

  }

  /**
   * Returns a live preview link for an entity
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *
   * @return \Drupal\Core\Link
   */
  public function getLiveUrl(
    EntityInterface $entity
  ) {
    return $this->getExternalUrl($entity, self::LIVE_ENV_VARNAME);

  }

  protected function getExternalUrl($entity, $envVarName) {
    // @TODO make generic, not node-specific
    $alias = $this->pathAliasManager->getAliasByPath('/node/' . $entity->id());
    if ($base_url = getenv($envVarName)) {
      $url = $base_url . $alias;
    }
    return
      Url::fromUri($url);
  }

}