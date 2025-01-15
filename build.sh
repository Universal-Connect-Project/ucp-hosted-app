#!/bin/bash

if [ -n "$REVIEW_APP" ]; then
  echo "Running build:review..."
  npm run build:review
elif [ -n "$STAGING" ]; then
  echo "Running build:staging..."
  npm run build:staging
elif [ -n "$PRODUCTION" ]; then
  echo "Running build:prod..."
  npm run build:prod
else
  echo "No environment variable set. No build started..."
fi
