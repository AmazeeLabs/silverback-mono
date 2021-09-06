<?php

namespace Drupal\silverback_cdn_redirect\EventSubscriber;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class MissingTranslationRedirectSubscriber implements EventSubscriberInterface {

  protected LanguageManagerInterface $languageManager;

  protected RouteMatchInterface $routeMatch;

  /**
   * @var string[]
   */
  protected array $entityTypes;

  public function __construct(LanguageManagerInterface $language_manager, RouteMatchInterface $route_match, ConfigFactoryInterface $configFactory) {
    $this->languageManager = $language_manager;
    $this->routeMatch = $route_match;
    $this->entityTypes = $configFactory
      ->get('silverback_cdn_redirect.settings')
      ->get('missing_translation_redirect_entity_types') ?: [];
  }

  public static function getSubscribedEvents() {
    return [
      KernelEvents::REQUEST => [
        // We need this subscriber to run after the router_listener service
        // (which has priority 32) so that the parameters are set into the
        // request.
        ['onKernelRequest', 30],
      ]
    ];
  }

  public function onKernelRequest(RequestEvent $event) {
    // In case the user tries to access an entity in a different language than
    // the current content one, we perform a redirect using the actual language
    // of the entity from the route. This means that the language of the
    // interface will most probably change as well.
    foreach ($this->entityTypes as $entityType) {
      $routeName = 'entity.' . $entityType . '.canonical';
      if ($this->routeMatch->getRouteName() !== $routeName) {
        continue;
      }

      $entity = $this->routeMatch->getCurrentRouteMatch()->getParameter($entityType);
      $requestedLanguageId = $this->languageManager->getCurrentLanguage(LanguageInterface::TYPE_CONTENT)->getId();
      if ($entity->language()->getId() === $requestedLanguageId) {
        return;
      }

      $url = Url::fromRoute(
        $routeName,
        [
          $entityType => $entity->id(),
        ],
        [
          'language' => $entity->language(),
          'query' => [
            'show_warning' => 'content_language_not_available',
            'original_language' => $requestedLanguageId,
          ] + $event->getRequest()->query->all(),
        ]
      );
      $response = new TrustedRedirectResponse($url->toString());

      // Add the necessary cache contexts to the response, as redirect
      // responses are cached as well.
      $response->getCacheableMetadata()
        ->addCacheContexts([
          'languages:language_content',
          'url.query_args',
        ])
        ->addCacheableDependency($entity);

      $event->setResponse($response);
      return;
    }
  }
}
