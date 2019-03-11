// Add imported components here.

import './styles.css';

import Twig from 'twig';

// Fake translation filter, to mock Drupal's behavior.
Twig.extendFilter("t", function(value) {
    return value;
});

