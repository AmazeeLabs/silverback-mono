<?php

namespace Drupal\silverback_gutenberg;

use Drupal\Component\Utility\Html;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\StreamWrapper\PublicStream;
use Drupal\Core\Url;
use Drupal\path_alias\AliasManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class LinkProcessor {

  protected AliasManagerInterface $pathAliasManager;
  protected ConfigFactoryInterface $configFactory;
  protected ModuleHandlerInterface $moduleHandler;
  protected string $currentHost;
  protected string $currentPort;

  public function __construct(
    AliasManagerInterface $pathAliasManager,
    ConfigFactoryInterface $configFactory,
    RequestStack $requestStack,
    ModuleHandlerInterface $moduleHandler
  ) {
    $this->pathAliasManager = $pathAliasManager;
    $this->configFactory = $configFactory;
    $this->moduleHandler = $moduleHandler;
    $this->currentHost = $requestStack->getCurrentRequest()->getHost();
    $this->currentPort = $requestStack->getCurrentRequest()->getPort();
  }

  public function processLinks(string $html, string $direction, LanguageInterface $language = NULL) {
    if (!in_array($direction, ['inbound', 'outbound'], TRUE)) {
      throw new \Exception('Unknown direction: "' . $direction . '".');
    }
    if ($direction === 'outbound' && !$language) {
      throw new \Exception('$language is required for "outbound" direction.');
    }

    $document = Html::load($html);

    foreach ($document->getElementsByTagName('a') as $link) {
      $this->processLink($link, $direction, $language);
    }

    $xpath = new \DOMXpath($document);
    $comments = $xpath->query('//comment()');
    /** @var \DOMComment $comment */
    foreach ($comments as $comment) {
      if (preg_match('/^(\s*wp:)(\S+)(\s*)({.*})(\s*\/\s*)$/s', $comment->textContent, $matches)) {
        $blockName = $matches[2];
        $json = $matches[4];
        $attributes = json_decode($json, TRUE);
        $callback = fn(string $url) => $this->processUrl($url, $direction, $language);
        $this->moduleHandler->alter(
          'silverback_gutenberg_link_processor_block_attributes',
          $attributes,
          $blockName,
          $callback
        );
        $jsonNew = json_encode($attributes);
        if ($jsonNew !== $json) {
          $comment->textContent = $matches[1] . $blockName . $matches[3] . $jsonNew . $matches[5];
        }
      }
    }

    $processed = Html::serialize($document);

    // This entity kills Gutenberg.
    $processed = str_replace('&#13;', "\r", $processed);

    return $processed;
  }

  public function isExternal(string $url): bool {
    $parts = parse_url($url);
    if (isset($parts['scheme'])) {
      return TRUE;
    }
    if (!isset($parts['host'])) {
      return FALSE;
    }
    if (
      $parts['host'] !== $this->currentHost &&
      (
        !isset($parts['port']) ||
        ($parts['port'] != $this->currentPort)
      )
    ) {
      return TRUE;
    }
    else {
      return FALSE;
    }
  }

  public function isAsset(string $url): bool {
    $parts = parse_url($url);
    if (empty($parts['path'])) {
      return FALSE;
    }
    if ($this->isExternal($url)) {
      // We have no reliable way to check if an external URL is an asset.
      return FALSE;
    }
    if (strpos($parts['path'], '/' . PublicStream::basePath() . '/') === 0) {
      return TRUE;
    }
    if (strpos($parts['path'], '/system/files') !== FALSE) {
      return TRUE;
    }
    return FALSE;
  }

  protected function cleanUrl(string $url): string {
    if ($this->isExternal($url)) {
      return $url;
    }
    $parts = parse_url($url);
    unset($parts['scheme'], $parts['host'], $parts['port'], $parts['user'], $parts['pass']);
    return $this->buildUrl($parts);
  }

  protected function processLink(\DOMElement $link, string $direction, LanguageInterface $language = NULL) {
    if ($direction === 'outbound' && !$language) {
      throw new \Exception('$language is required for "outbound" direction.');
    }

    $href = $link->getAttribute('href');
    if ($href) {
      if (!$this->isExternal($href)) {
        $href = $this->cleanUrl($href);
      }

      $link->setAttribute('href', $this->processUrl($href, $direction, $language));
    }

    if ($direction === 'inbound') {
      $this->moduleHandler->alter('silverback_gutenberg_link_processor_inbound_link', $link, $this);
    }
    if ($direction === 'outbound') {
      $this->moduleHandler->alter('silverback_gutenberg_link_processor_outbound_link', $link, $language, $this);
    }

  }

  public function processUrl(string $url, string $direction, LanguageInterface $language = NULL): string {
    if ($direction === 'outbound' && !$language) {
      throw new \Exception('$language is required for "outbound" direction.');
    }

    if ($this->isExternal($url)) {
      return $url;
    }

    $parts = parse_url($url);

    if (empty($parts['path'])) {

      // Corrupted URL.
      return $url;
    }

    if ($direction === 'inbound') {
      $path = $this->pathAliasManager->getPathByAlias($parts['path']);
      if ($path !== $parts['path']) {
        $parts['path'] = $path;
      }
      else {
        // Try to strip the language prefix.
        $prefixes = $this->configFactory
          ->get('language.negotiation')
          ->get('url.prefixes');
        $pathLangcode = null;
        foreach ($prefixes as $langcode => $prefix) {
          if ('/' . $prefix === $parts['path']) {
            $withoutPrefix = '/';
            break;
          }
          elseif (strpos($parts['path'], '/' . $prefix . '/') === 0) {
            $pathLangcode = $langcode;
            $withoutPrefix = substr($parts['path'], strlen($prefix) + 1);
            break;
          }
        }
        if (!empty($withoutPrefix)) {
          $path = $this->pathAliasManager->getPathByAlias($withoutPrefix, $pathLangcode);
          if ($path !== $withoutPrefix) {
            $parts['path'] = $path;
          } else {
            /** @var \Drupal\Core\Routing\Router $router */
            $router = \Drupal::service('router.no_access_checks');
            try {
              $router->match($withoutPrefix);
              // This is a Drupal path, so we strip the prefix.
              $parts['path'] = $withoutPrefix;
            }
            catch (\Throwable $e) { }
          }
        }
      }
    }

    if ($direction === 'outbound') {
      if ((strpos($parts['path'], '/') !== 0) && (strpos($parts['path'], '#') !== 0) && (strpos($parts['path'], '?') !== 0)) {
        /* @see \Drupal\Core\Url::fromUserInput  */
        $parts['path'] = '/' . $parts['path'];
      }
      $pathAlias = Url::fromUserInput($parts['path'])
        ->setAbsolute(FALSE)
        ->setOption('language', $language)
        ->toString(TRUE)
        ->getGeneratedUrl();
      if ($pathAlias !== $parts['path']) {
        $parts['path'] = $pathAlias;
      }
    }

    $url = $this->buildUrl($parts);

    if ($direction === 'inbound') {
      $this->moduleHandler->alter('silverback_gutenberg_link_processor_inbound_url', $url, $this);
    }
    if ($direction === 'outbound') {
      $this->moduleHandler->alter('silverback_gutenberg_link_processor_outbound_url', $url, $language, $this);
    }

    return $url;
  }

  protected function buildUrl(array $parts): string {
    return (isset($parts['scheme']) ? "{$parts['scheme']}:" : '') .
      ((isset($parts['user']) || isset($parts['host'])) ? '//' : '') .
      (isset($parts['user']) ? "{$parts['user']}" : '') .
      (isset($parts['pass']) ? ":{$parts['pass']}" : '') .
      (isset($parts['user']) ? '@' : '') .
      (isset($parts['host']) ? "{$parts['host']}" : '') .
      (isset($parts['port']) ? ":{$parts['port']}" : '') .
      (isset($parts['path']) ? "{$parts['path']}" : '') .
      (isset($parts['query']) ? "?{$parts['query']}" : '') .
      (isset($parts['fragment']) ? "#{$parts['fragment']}" : '');
  }

}
