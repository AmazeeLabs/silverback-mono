<?php

namespace Drupal\silverback_preview_link\Controller;

use Drupal\Core\Cache\CacheableResponse;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\silverback_preview_link\QRCodeWithLogo;
use Drupal\user\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;

class PreviewController extends ControllerBase {

  /**
   * Checks if the current user has access to the Preview app.
   */
  public function hasAccess() {
    /** @var \Drupal\Core\Session\AccountProxyInterface $userAccount */
    $userAccount = $this->currentUser();
    // Verify permission against User entity.
    $userEntity = User::load($userAccount->id());
    if ($userEntity->hasPermission('use external preview')) {
      return new JsonResponse([
        'access' => TRUE,
      ], 200);
    }
    else {
      return new JsonResponse([
        'access' => FALSE,
      ], 403);
    }
  }

  /**
   * Skip Drupal authentication if there is a valid preview token.
   */
  public function hasLinkAccess() {
    $requestContent = \Drupal::request()->getContent();
    $body = json_decode($requestContent, TRUE);
    if (
      !empty($body['preview_access_token']) &&
      !empty($body['entity_id']) &&
      !empty($body['entity_type_id'])
    ) {
      try {
        $entity = \Drupal::entityTypeManager()->getStorage($body['entity_type_id'])->load($body['entity_id']);
        if ($entity instanceof ContentEntityInterface) {
          $previewAccessChecker = \Drupal::service('access_check.silverback_preview_link');
          $accessResult = $previewAccessChecker->access($entity, $body['preview_access_token']);
          if ($accessResult->isAllowed()) {
            return new JsonResponse([
              'access' => TRUE,
            ], 200);
          }
        }
      }
      catch (\Exception $e) {
        $this->getLogger('silverback_preview_link')->error($e->getMessage());
      }
    }
    return new JsonResponse([
      'access' => FALSE,
    ], 403);
  }

  /**
   * Returns the QR SVG file.
   */
  public function getQRCode(string $base64_url): CacheableResponse {
    $decodedUrl = base64_decode(str_replace(['_'], ['/'], $base64_url));
    $qrCode = new QRCodeWithLogo();
    $result = $qrCode->getQRCode($decodedUrl);
    return new CacheableResponse($result, 200, ['Content-Type' => 'image/svg+xml']);
  }

}
