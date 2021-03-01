#!/bin/bash
set -e

function get_code {
  echo $(curl -X $1 --write-out '%{http_code}' --silent --output /dev/null http://localhost:8888/test-session/set)
}

./scripts/start.sh 'true'

CODE=$(get_code POST)
if [ "$CODE" -ne 200 ]
then
  >&2 echo "Should have received 200 for a POST request with test_session enabled. Got '$CODE'"
    exit 1
fi

CODE=$(get_code GET)
if [ "$CODE" -ne 404 ]
then
  >&2 echo "Should have received 404 for a GET request with test_session enabled. Got '$CODE'"
    exit 1
fi

./scripts/start.sh 'false'

CODE=$(get_code POST)
if [ "$CODE" -ne 404 ]
then
  >&2 echo "Should have received 404 for a POST request with test_session disabled. Got '$CODE'"
    exit 1
fi
