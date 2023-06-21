<?php

namespace Drupal\silverback_campaign_urls\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;

/**
 * Validation constraint for unique campaign url source.
 *
 * @Constraint(
 *   id = "UniqueCampaignUrlSource",
 *   label = @Translation("Unique campaign url source.", context = "Validation"),
 * )
 */
class UniqueCampaignUrlSourceConstraint extends Constraint {

  public $message = 'The campaign url %campaign_url is already in use.';
}
