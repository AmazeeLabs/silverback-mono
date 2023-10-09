<?php
namespace Drupal\graphql_directives;

use Symfony\Component\Yaml\Yaml;
use Webmozart\Glob\Glob;


/**
 * Load a graphql schema from a graphql-config file.
 * https://the-guild.dev/graphql/config/docs/user/schema#multiple-files
 *
 * Only supports local files.
 */
class ConfigLoader {
  public static function loadSchema($configFile) {
    $configDir = dirname($configFile);
    $config = Yaml::parseFile($configFile);
    $configFiles = is_array($config['schema']) ? $config['schema'] : [$config['schema']];
    $result = [];
    foreach ($configFiles as $glob) {
      $files = Glob::glob($configDir . '/' . $glob);
      foreach ($files as $file) {
        $result[$file] = file_get_contents($file);
      }
    }
    return implode("\n", $result);
  }
}
