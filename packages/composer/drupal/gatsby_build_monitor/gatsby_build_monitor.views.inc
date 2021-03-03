<?php

/**
 * Implements hook_views_data().
 */
function gatsby_build_monitor_views_data() {
  $data = [];

  $data['gatsby_build_monitor_stats']['table']['group'] = t('Gatsby Build Monitor');
  $data['gatsby_build_monitor_stats']['table']['base'] = [
    'field' => 'id',
    'title' => t('Gatsby Build logs'),
  ];
  $data['gatsby_build_monitor_stats']['id'] = [
    'title' => t('ID'),
    'field' => ['id' => 'standard'],
    'filter' => ['id' => 'numeric'],
    'argument' => ['id' => 'numeric'],
    'sort' => ['id' => 'standard'],
  ];
  $data['gatsby_build_monitor_stats']['started'] = [
    'title' => t('Started'),
    'field' => ['id' => 'date'],
    'argument' => ['id' => 'date'],
    'filter' => ['id' => 'date'],
    'sort' => ['id' => 'date'],
  ];
  $data['gatsby_build_monitor_stats']['finished'] = [
    'title' => t('Finished'),
    'field' => ['id' => 'date'],
    'argument' => ['id' => 'date'],
    'filter' => ['id' => 'date'],
    'sort' => ['id' => 'date'],
  ];
  $data['gatsby_build_monitor_stats']['spent'] = [
    'title' => t('Spent'),
    'field' => ['id' => 'date'],
    'filter' => ['id' => 'date'],
    'argument' => ['id' => 'date'],
    'sort' => ['id' => 'date'],
  ];
  $data['gatsby_build_monitor_stats']['has_errors'] = [
    'title' => t('Has errors'),
    'field' => ['id' => 'boolean'],
    'filter' => ['id' => 'boolean'],
    'argument' => ['id' => 'boolean'],
    'sort' => ['id' => 'boolean'],
  ];
  $data['gatsby_build_monitor_stats']['has_warnings'] = [
    'title' => t('Has warnings'),
    'field' => ['id' => 'boolean'],
    'filter' => ['id' => 'boolean'],
    'argument' => ['id' => 'boolean'],
    'sort' => ['id' => 'boolean'],
  ];
  $data['gatsby_build_monitor_stats']['output'] = [
    'title' => t('Output'),
    'field' => ['id' => 'standard'],
//    'filter' => ['id' => 'standard'],
//    'argument' => ['id' => 'standard'],
//    'sort' => ['id' => 'standard'],
  ];

  return $data;
}
