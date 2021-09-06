<?php

namespace Drupal\silverback_iframe\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class SilverbackIframeEventSubscriber implements EventSubscriberInterface {

  public function onKernelResponse(ResponseEvent $event) {
    if (silverback_iframe_theme_enabled()) {
      $event->getResponse()->headers->remove('X-Frame-Options');
    }
  }

  public static function getSubscribedEvents() {
    $events[KernelEvents::RESPONSE][] = ['onKernelResponse', -10];
    return $events;
  }

}
