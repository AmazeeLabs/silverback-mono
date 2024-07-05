<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Url;

/**
 * Interface for the preview link entity.
 */
interface SilverbackPreviewLinkInterface extends ContentEntityInterface {

  /**
   * The URL for this preview link for an entity.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   A host entity.
   *
   * @return \Drupal\Core\Url
   *   The url object.
   */
  public function getUrl(EntityInterface $entity): Url;

  /**
   * Gets thew new token.
   *
   * @return string
   *   The token.
   */
  public function getToken(): string;

  /**
   * Set the new token.
   *
   * @param string $token
   *   The new token.
   *
   * @return $this
   *   Return this for chaining.
   */
  public function setToken(string $token);

  /**
   * Mark the entity needing a new token. Only updated upon save.
   *
   * @param bool $needs_new_token
   *   Tell this entity to generate a new token.
   *
   * @return bool
   *   TRUE if it was currently marked to generate otherwise FALSE.
   */
  public function regenerateToken($needs_new_token = FALSE): bool;

  /**
   * Gets the timestamp stamp of when the token was generated.
   *
   * @return int
   *   The timestamp.
   */
  public function getGeneratedTimestamp(): int;

  /**
   * Get entities this preview link unlocks.
   *
   * Ideally preview link access is determined via PreviewLinkHost service.
   *
   * @return \Drupal\Core\Entity\EntityInterface[]
   *   Associated entities.
   */
  public function getEntities(): array;

  /**
   * Set the entity this preview link unlocks.
   *
   * @return $this
   *   Return this for chaining.
   */
  public function setEntities(array $entities);

  /**
   * Add an entity for this preview link to unlock.
   *
   * @return $this
   *   Return this for chaining.
   */
  public function addEntity(EntityInterface $entity);

  /**
   * Get expiration date.
   *
   * @return \DateTimeImmutable|null
   *   The expiration date, or NULL if not set.
   */
  public function getExpiry(): ?\DateTimeImmutable;

  /**
   * Set the expiration date.
   *
   * @param \DateTimeInterface $expiry
   *   The expiration date.
   *
   * @return $this
   *   Return this for chaining.
   */
  public function setExpiry(\DateTimeInterface $expiry);

}
