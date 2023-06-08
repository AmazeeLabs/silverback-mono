<?php

namespace Drupal\silverback_campaign_urls\Form;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\Core\TempStore\PrivateTempStoreFactory;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StringTranslation\TranslationInterface;

/**
 * Provides a campaign URL deletion confirmation form.
 */
class CampaignUrlDeleteMultipleForm extends ConfirmFormBase {

  /**
   * The array of campaign URLs to delete.
   *
   * @var string[][]
   */
  protected $campaignURLs = [];

  /**
   * The private tempstore factory.
   *
   * @var \Drupal\Core\TempStore\PrivateTempStoreFactory
   */
  protected $privateTempStoreFactory;

  /**
   * The campaign URL storage.
   *
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $campaignUrlStorage;

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $currentUser;

  /**
   * Constructs a CampaignUrlDeleteMultipleForm object.
   *
   * @param \Drupal\Core\TempStore\PrivateTempStoreFactory $temp_store_factory
   *   The tempstore factory.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Session\AccountInterface $account
   *   The current user.
   * @param \Drupal\Core\StringTranslation\TranslationInterface $string_translation
   *   The String translation.
   */
  public function __construct(
    PrivateTempStoreFactory $temp_store_factory,
    EntityTypeManagerInterface $entity_type_manager,
    AccountInterface $account,
    TranslationInterface $string_translation
  ) {
    $this->privateTempStoreFactory = $temp_store_factory;
    $this->campaignUrlStorage = $entity_type_manager->getStorage('campaign_url');
    $this->currentUser = $account;
    $this->setStringTranslation($string_translation);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('tempstore.private'),
      $container->get('entity_type.manager'),
      $container->get('current_user'),
      $container->get('string_translation')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'campaign_url_multiple_delete_confirm';
  }

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return $this->formatPlural(count($this->campaignURLs), 'Are you sure you want to delete this campaign URL?', 'Are you sure you want to delete these campaign URLs?');
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('campaign_url.list');
  }

  /**
   * {@inheritdoc}
   */
  public function getConfirmText() {
    return $this->t('Delete');
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $this->campaignURLs = $this->privateTempStoreFactory->get('campaign_url_multiple_delete_confirm')->get($this->currentUser->id());
    if (empty($this->campaignURLs)) {
      return new RedirectResponse($this->getCancelUrl()->setAbsolute()->toString());
    }

    $form['campaign_urls'] = [
      '#theme' => 'item_list',
      '#items' => array_map(function ($campaignURL) {
        return $campaignURL->label();
      }, $this->campaignURLs),
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

    if ($form_state->getValue('confirm') && !empty($this->campaignURLs)) {
      $this->campaignUrlStorage->delete($this->campaignURLs);
      $this->privateTempStoreFactory->get('campaign_url_multiple_delete_confirm')->delete($this->currentUser->id());
      $count = count($this->campaignURLs);
      $this->logger('campaign_url')->notice('Deleted @count campaign URLs.', ['@count' => $count]);
      $this->messenger()->addMessage($this->stringTranslation->formatPlural($count, 'Deleted 1 campaign URL.', 'Deleted @count campaign URLs.'));
    }
    $form_state->setRedirect('campaign_url.list');
  }

}
