#!/bin/sh

# Check if InfluxDB is already running
if docker ps --format '{{.Names}}' | grep -q "influxdb"; then
  echo "InfluxDB is already running."
else
  echo "Starting InfluxDB..."

  # Check if InfluxDB has been initialized before
  if docker volume inspect influxdb_volume >/dev/null 2>&1; then
    echo "Existing InfluxDB volume found, starting container..."
    docker run --rm --name influxdb \
      -p 8086:8086 \
      -v influxdb_volume:/var/lib/influxdb2 \
      -e INFLUXD_STORAGE_WAL_FSYNC_DELAY=0s \
      -e INFLUXD_HTTP_AUTH_ENABLED=false \
      -e INFLUXD_STORAGE_CACHE_SNAPSHOT_MEMORY_SIZE=0 \
      -e INFLUXD_STORAGE_CACHE_SNAPSHOT_WRITE_COLD_DURATION=0s \
      influxdb:latest
  else
    echo "No existing InfluxDB setup found. Running initial setup..."
    docker run -p 8086:8086 -v influxdb_volume:/var/lib/influxdb2 \
      -e INFLUXD_HTTP_AUTH_ENABLED=false \
      -e INFLUXDB_REPORTING_DISABLED=true \
      -e DOCKER_INFLUXDB_INIT_MODE=setup \
      -e DOCKER_INFLUXDB_INIT_USERNAME=admin \
      -e DOCKER_INFLUXDB_INIT_PASSWORD=password \
      -e DOCKER_INFLUXDB_INIT_ORG=ucp-org \
      -e DOCKER_INFLUXDB_INIT_BUCKET=performance \
      -e DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=my-secret-token \
      influxdb:latest
  fi
fi
