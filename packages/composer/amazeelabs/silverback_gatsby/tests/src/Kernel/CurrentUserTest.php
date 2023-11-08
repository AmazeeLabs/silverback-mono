<?php

namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\user\Entity\User;

class CurrentUserTest extends EntityFeedTestBase {
  function testAnonymousUser() {
    $query = $this->getQueryFromFile('current-user.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->setCacheMaxAge(0);
    $anonymous = User::load(0);
    $metadata->addCacheTags($anonymous->getCacheTags());
    $this->setCurrentUser($anonymous);
    $this->assertResults($query, [], [
      '_currentUser' => [
        'id' => '0',
        'name' => null,
      ],
    ], $metadata);
  }

  function testAuthenticatedUser() {
    $query = $this->getQueryFromFile('current-user.gql');
    $testuser = $this->createUser([], 'test');
    $metadata = $this->defaultCacheMetaData();
    $metadata->setCacheMaxAge(0);
    $metadata->addCacheTags($testuser->getCacheTags());
    $this->setCurrentUser($testuser);
    $this->assertResults($query, [], [
      '_currentUser' => [
        'id' => $testuser->id(),
        'name' => $testuser->name->value,
      ],
    ], $metadata);
  }
}