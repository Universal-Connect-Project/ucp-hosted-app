#!/bin/sh
if [ "$GITHUB_ACTIONS" = "true" ]; then
  echo "Skipping Redis in GitHub Actions."
  exit 0
fi

docker run --rm --name performance_service_redis -p 6380:6379 redis:7.2-alpine
