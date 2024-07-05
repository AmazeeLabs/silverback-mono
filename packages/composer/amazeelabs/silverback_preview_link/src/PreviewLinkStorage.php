<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Component\Uuid\UuidInterface;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Cache\MemoryCache\MemoryCacheInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeBundleInfoInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Sql\SqlContentEntityStorage;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\silverback_preview_link\Entity\SilverbackPreviewLinkInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Preview Link entity storage.
 */
final class PreviewLinkStorage extends SqlContentEntityStorage implements PreviewLinkStorageInterface {

  /**
   * Constructs a new PreviewLinkStorage.
   */
  public function __construct(
    EntityTypeInterface $entity_type,
    Connection $database,
    EntityFieldManagerInterface $entity_field_manager,
    CacheBackendInterface $cache,
    LanguageManagerInterface $language_manager,
    MemoryCacheInterface $memory_cache,
    EntityTypeBundleInfoInterface $entity_type_bundle_info,
    EntityTypeManagerInterface $entity_type_manager,
    UuidInterface $uuid,
    protected TimeInterface $time,
  ) {
    parent::__construct($entity_type, $database, $entity_field_manager, $cache, $language_manager, $memory_cache, $entity_type_bundle_info, $entity_type_manager);
    $this->uuidService = $uuid;
  }

  /**
   * {@inheritdoc}
   */
  public static function createInstance(ContainerInterface $container, EntityTypeInterface $entity_type): self {
    return new static(
      $entity_type,
      $container->get('database'),
      $container->get('entity_field.manager'),
      $container->get('cache.entity'),
      $container->get('language_manager'),
      $container->get('entity.memory_cache'),
      $container->get('entity_type.bundle.info'),
      $container->get('entity_type.manager'),
      $container->get('uuid'),
      $container->get('datetime.time'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function create(array $values = []) {
    return parent::create($values + [
      'token' => $this->generateUniqueToken(),
      'generated_timestamp' => $this->time->getRequestTime(),
    ]);
  }

  /**
   * {@inheritdoc}
   */
  public function save(EntityInterface $entity) {
    assert($entity instanceof SilverbackPreviewLinkInterface);
    if ($entity->regenerateToken()) {
      $entity->setToken($this->generateUniqueToken());
    }
    return parent::save($entity);
  }

  /**
   * Gets the unique token for the link.
   *
   * This token is unique every time we generate a link, there is nothing
   * from the original entity involved in the token so it does not need to be
   * cryptographically secure, only sufficiently random which UUID is.
   *
   * @return string
   *   A unique identifier for this preview link.
   */
  protected function generateUniqueToken(): string {
    return $this->uuidService->generate();
  }

}
