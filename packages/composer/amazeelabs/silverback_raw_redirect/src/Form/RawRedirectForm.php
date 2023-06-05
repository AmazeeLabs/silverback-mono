<?php

namespace Drupal\silverback_raw_redirect\Form;

use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;

class RawRedirectForm extends ContentEntityForm {

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    parent::save($form, $form_state);
    $this->messenger()->addMessage(t('The redirect has been saved.'));
    $form_state->setRedirect('raw_redirect.list');
  }

  /**
   * {@inheritDoc}
   */
  public function form(array $form, FormStateInterface $form_state) {
    $form = parent::form($form, $form_state);
    /** @var \Drupal\silverback_raw_redirect\Entity\RawRedirect $redirect */
    $redirect = $this->entity;
    $defaultCode = $redirect->getStatusCode() ? $redirect->getStatusCode() : 301;
    $form['status_code'] = [
      '#type' => 'select',
      '#title' => $this->t('Redirect status'),
      '#description' => $this->t('You can find more information about HTTP redirect status codes at <a href="@status-codes" target="_blank">@status-codes</a>. Additionally, some hosting providers, like Netlify, support also URL rewrites, which means you can assign a 200 status code to redirect rules. Here is some <a href="@rewrite-docs" target="_blank">more documentation</a>.', ['@status-codes' => 'http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#3xx_redirection', '@rewrite-docs' => 'https://docs.netlify.com/routing/redirects/rewrites-proxies']),
      '#default_value' => $defaultCode,
      '#options' => [
        200 => t('200 Rewrite'),
        300 => t('300 Multiple Choices'),
        301 => t('301 Moved Permanently'),
        302 => t('302 Found'),
        303 => t('303 See Other'),
        304 => t('304 Not Modified'),
        305 => t('305 Use Proxy'),
        307 => t('307 Temporary Redirect'),
      ]
    ];
    return $form;
  }
}
