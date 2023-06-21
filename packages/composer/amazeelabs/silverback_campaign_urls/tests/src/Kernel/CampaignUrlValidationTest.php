<?php

namespace Drupal\Tests\silverback_campaign_urls\Kernel;

use Drupal\KernelTests\Core\Entity\EntityKernelTestBase;
use Drupal\silverback_campaign_urls\Entity\CampaignUrl;

/**
 * Tests campaign urls validation constraints.
 */
class CampaignUrlValidationTest extends EntityKernelTestBase {

  protected static $modules = ['silverback_campaign_urls'];

  /**
   * {@inheritDoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->installEntitySchema('campaign_url');
  }

  public function testValidation() {
    $campaign = CampaignUrl::create([
      'campaign_url_source' => '/campaign_test',
      'campaign_url_destination' => '/campaign_destination',
    ]);
    $violations = $campaign->validate();
    $this->assertCount(0, $violations, 'No violations when validating the first campaign url.');
    $campaign->save();

    $secondCampaign = CampaignUrl::create([
      'campaign_url_source' => '/second_campaign_test',
      'campaign_url_destination' => '/second_campaign_destination',
    ]);
    $violations = $secondCampaign->validate();
    $this->assertCount(0, $violations, 'No violations when validating the second campaign url.');
    $secondCampaign->save();

    $thirdCampaign = CampaignUrl::create([
      'campaign_url_source' => '/campaign_test',
      'campaign_url_destination' => '/third_campaign_destination',
    ]);
    $violations = $thirdCampaign->validate();
    $this->assertCount(1, $violations, 'Violation found when trying to create a campaign with an already existing source.');
    $this->assertEquals('The campaign url <em class="placeholder">/campaign_test</em> is already in use.', $violations[0]->getMessage());

    $existingCampaign = CampaignUrl::load($campaign->id());
    $violations = $existingCampaign->validate();
    $this->assertCount(0, $violations, 'No violations when editing a campaign and keeping its source.');

    $existingCampaign->set('campaign_url_source', '/second_campaign_test');
    $violations = $existingCampaign->validate();
    $this->assertCount(1, $violations, 'Violation found when trying to update a campaign with an already existing source.');
    $this->assertEquals('The campaign url <em class="placeholder">/second_campaign_test</em> is already in use.', $violations[0]->getMessage());
  }
}
