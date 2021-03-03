<?php

return [
  'description' => 'Stores build stats.',
  'fields' => [
    'id' => [
      'type' => 'serial',
      'not null' => TRUE,
      'description' => 'Primary Key: Unique record ID.',
    ],
    'started' => [
      'description' => 'The Unix timestamp when the build was started.',
      'type' => 'int',
      'unsigned' => TRUE,
      'not null' => TRUE,
      'default' => 0,
    ],
    'finished' => [
      'description' => 'The Unix timestamp when the build was finished.',
      'type' => 'int',
      'unsigned' => TRUE,
      'not null' => TRUE,
      'default' => 0,
    ],
    'spent' => [
      'description' => 'The amount of second taken by the build.',
      'type' => 'int',
      'unsigned' => TRUE,
      'not null' => TRUE,
      'default' => 0,
    ],
    'output' => [
      'type' => 'text',
      'not null' => TRUE,
      'size' => 'big',
      'output' => 'The output of `gatsby build`.',
    ],
    'has_errors' => [
      'description' => 'Boolean indicating whether the output contains "error" occurrences.',
      'type' => 'int',
      'not null' => TRUE,
      'default' => 0,
      'size' => 'tiny',
    ],
    'has_warnings' => [
      'description' => 'Boolean indicating whether the output contains "warning" occurrences.',
      'type' => 'int',
      'not null' => TRUE,
      'default' => 0,
      'size' => 'tiny',
    ],
  ],
  'primary key' => ['id'],
  'indexes' => [
    'started' => ['started'],
    'finished' => ['finished'],
    'spent' => ['spent'],
    'has_errors' => ['has_errors'],
    'has_warnings' => ['has_warnings'],
  ],
];
