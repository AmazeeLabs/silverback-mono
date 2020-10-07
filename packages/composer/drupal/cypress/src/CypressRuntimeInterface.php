<?php

namespace Drupal\cypress;

/**
 * Management interface for a cypress runtime.
 */
interface CypressRuntimeInterface {

  /**
   * Initiate the runtime with a given set of options.
   *
   * @param \Drupal\cypress\CypressOptions $options
   *   A cypress options object.
   *
   * @return void
   */
  public function initiate(CypressOptions $options);

  /**
   * Add a test suite to the current runtime.
   *
   * @param string $name
   *   The test suite machine name.
   * @param string $path
   *   The absolute path to the test suite directory.
   *
   * @return void
   */
  public function addSuite($name, $path);
}
