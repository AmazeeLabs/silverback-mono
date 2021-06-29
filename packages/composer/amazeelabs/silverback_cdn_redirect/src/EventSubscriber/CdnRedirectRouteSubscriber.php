<?php

namespace Drupal\silverback_cdn_redirect\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class CdnRedirectRouteSubscriber implements EventSubscriberInterface {

  static $currentLangcode;

  public static function getSubscribedEvents() {
    return [
      KernelEvents::REQUEST => [
        ['onKernelRequest', -10000],
      ]
    ];
  }

  public function onKernelRequest(RequestEvent $event) {
    if ($event->getRequest()->attributes->get('_silverback_cdn_redirect')) {
      if (!$event->hasResponse()) {
        // We are mostly interested in redirects from the redirect module. These
        // are set on the KernelEvents::REQUEST event. If a response was not set
        // there, there is no point in further request handling.
        $event->setResponse(new Response());
      }
      self::$currentLangcode = \Drupal::languageManager()->getCurrentLanguage()->getId();
    }
  }

}
