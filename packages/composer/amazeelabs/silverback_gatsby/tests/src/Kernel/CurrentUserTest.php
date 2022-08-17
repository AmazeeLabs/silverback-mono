<?php

namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\user\Entity\User;

class CurrentUserTest extends EntityFeedTestBase {
  function testAnonymousUser() {
    $query = $this->getQueryFromFile('current-user.gql');
    $metadata = $this->defaultCacheMetaData();
    $metadata->addCacheTags(['node_list']);
    $anonymous = User::load(0);
    $this->setCurrentUser($anonymous);
    $this->assertResults($query, [], [
      'currentUser' => [
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
      'currentUser' => [
        'id' => $testuser->id(),
        'name' => $testuser->name->value,
      ],
    ], $metadata);
  }
}
