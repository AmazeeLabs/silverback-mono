<?php

declare(strict_types = 1);

namespace Drupal\silverback_preview_link\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\dynamic_entity_reference\Plugin\Field\FieldWidget\DynamicEntityReferenceWidget;
use Drupal\silverback_preview_link\Form\PreviewLinkForm;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Form widget for entities field on Preview Link.
 *
 * Prevents mixing referenced entity types, unless they were created
 * programmatically.
 *
 * @FieldWidget(
 *   id = "silverback_preview_link_entities_widget",
 *   label = @Translation("Preview Link Entities Widget"),
 *   description = @Translation("Widget for selecting entities related to a Preview Link"),
 *   field_types = {
 *     "dynamic_entity_reference"
 *   }
 * )
 *
 * @internal
 */
final class PreviewLinkEntitiesWidget extends DynamicEntityReferenceWidget {

  /**
   * The current route match.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected RouteMatchInterface $routeMatch;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    $instance = parent::create($container, $configuration, $plugin_id, $plugin_definition);
    $instance->routeMatch = $container->get('current_route_match');
    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public static function isApplicable(FieldDefinitionInterface $field_definition) {
    $storageDefinition = $field_definition->getFieldStorageDefinition();
    return $storageDefinition->getTargetEntityTypeId() === 'silverback_preview_link' && $storageDefinition->getName() === 'entities';
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $element = parent::formElement($items, $delta, $element, $form, $form_state);
    $formObject = $form_state->getFormObject();
    if (!$formObject instanceof PreviewLinkForm) {
      throw new \LogicException('Can only be used with PreviewLinkForm');
    }

    /** @var \Drupal\dynamic_entity_reference\Plugin\Field\FieldType\DynamicEntityReferenceItem $item */
    $item = $items->get($delta);
    $targetType = $item->target_type;
    $targetId = $item->target_id;
    $host = $formObject->getHostEntity($this->routeMatch);
    $hostEntityTypeId = $host->getEntityTypeId();

    // Swap select field to value.
    if ($element['target_type']['#type'] !== 'value') {
      $element['target_type'] = [
        '#type' => 'value',
        '#value' => $targetType,
      ];
    }

    // If target type not set yet (e.g for new items). Set the value.
    if (empty($targetType)) {
      // Force new items to be the same as host entity type.
      $element['target_type']['#value'] = $hostEntityTypeId;

      // Set otherwise autocomplete will use the wrong route.
      $settings = $this->getFieldSettings();
      $element['target_id']['#target_type'] = $hostEntityTypeId;
      $element['target_id']['#selection_handler'] = $settings[$hostEntityTypeId]['handler'];
      $element['target_id']['#selection_settings'] = $settings[$hostEntityTypeId]['handler_settings'];
    }

    // Protect host entity from modification.
    if ($targetType == $hostEntityTypeId && $targetId == $host->id()) {
      $element['target_id']['#disabled'] = TRUE;
    }

    return $element;
  }

}
