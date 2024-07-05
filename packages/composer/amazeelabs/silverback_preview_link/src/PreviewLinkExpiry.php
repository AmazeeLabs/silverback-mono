<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link;

use Drupal\Core\Config\ConfigFactoryInterface;

/**
 * Calculates link expiry time.
 */
class PreviewLinkExpiry {

  /**
   * Default expiry time in seconds. This amounts to 7 days.
   *
   * @var int
   */
  const DEFAULT_EXPIRY_SECONDS = 86400;

  /**
   * Statically cache the lifetime.
   *
   * @var int|null
   */
  protected ?int $lifetime = NULL;

  /**
   * LinkExpiry constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   The configuration factory.
   */
  public function __construct(
    protected ConfigFactoryInterface $configFactory,
  ) {
  }

  /**
   * Calculates default lifetime of a preview link.
   *
   * @return int
   *   Lifetime in seconds.
   *
   * @phpstan-return int<0, max>
   */
  public function getLifetime(): int {
    if (!isset($this->lifetime)) {
      $config = $this->configFactory->get('silverback_preview_link.settings');
      $this->lifetime = (int) ($config->get('expiry_seconds') ?: self::DEFAULT_EXPIRY_SECONDS);
    }
    return max(0, $this->lifetime);
  }

}
