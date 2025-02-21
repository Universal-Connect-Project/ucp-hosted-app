#!/bin/sh
if [ "$GITHUB_ACTION" = "true" ]; then
  echo "Skipping Redis in GitHub Actions."
  exit 0
fi

docker run --rm --name ucw_redis -p 6379:6379 redis:7.2-alpine
