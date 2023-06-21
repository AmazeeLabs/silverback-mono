<?php

namespace Drupal\silverback_campaign_urls\Plugin\Validation\Constraint;

use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

/**
 * Validates the UniqueCampaignUrlSourceConstraint constraint
 */
class UniqueCampaignUrlSourceConstraintValidator extends ConstraintValidator implements ContainerInjectionInterface {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Creates a new UniqueCampaignUrlSourceConstraintValidator instance.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager')
    );
  }

  /**
   * {@inheritDoc}
   */
  public function validate($entity, Constraint $constraint) {
    /** @var \Drupal\silverback_campaign_urls\Entity\CampaignUrlInterface $entity */
    $source = $entity->getSource();
    $query = $this->entityTypeManager->getStorage('campaign_url')->getQuery();
    $query->condition('campaign_url_source', $source);
    if (!$entity->isNew()) {
      $query->condition('cid', $entity->id(), '<>');
    }
    $query->accessCheck(FALSE);
    $result = $query->execute();
    if (!empty($result)) {
      $this->context->buildViolation($constraint->message, [
        '%campaign_url' => $source,
      ])->addViolation();
    }
  }
}
