<?php

namespace AmazeeLabs\Silverback\Helpers;

use Symfony\Component\Console\Question\Question;

class EnvironmentQuestion extends Question {

  public function __construct($question, $default = NULL) {
    parent::__construct("<question>$question</question> <info>[$default]</info>: ", $default);
  }

}
