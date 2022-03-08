<?php

namespace Drupal\silverback_translations\Controller;

use Drupal\Core\Cache\Cache;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\silverback_translations\TranslationsProcessorInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class TranslationsController extends ControllerBase {

  /**
   * @var TranslationsProcessorInterface $translationsProcessor
   *  The translations processor service
   */
  protected $translationsProcessor;

  /**
   * @var LanguageManagerInterface $languageManager
   *
   * The language manager service.
   */
  protected $languageManager;

  /**
   * TranslationsController constructor.
   */
  public function __construct(TranslationsProcessorInterface $translations_processor, LanguageManagerInterface $language_manager) {
    $this->translationsProcessor = $translations_processor;
    $this->languageManager = $language_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('silverback_translations.json_processor'),
      $container->get('language_manager')
    );
  }

  /**
   * Controller callback to create new string translation sources.
   */
  public function createSources($context, Request $request) {
    $defaultLanguage = $request->get('defaultLanguage', $this->languageManager->getDefaultLanguage()->getId());
    $this->translationsProcessor->createSources($request->getContent(), $context, $defaultLanguage);
    // Invalidate cache when new strings have been added.
    Cache::invalidateTags(['locale']);
    return new JsonResponse([
      'status' =>'success',
      'message' => 'Translation sources created.',
    ]);
  }
}
