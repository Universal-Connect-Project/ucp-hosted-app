#!/bin/sh

check_container_running() {
  if docker ps --format '{{.Names}}' | grep -q "influxdb"; then
    return 0 # Container is running
  else
    return 1 # Container is not running
  fi
}

if check_container_running; then
  echo "InfluxDB container is already running."
else
  echo "Starting InfluxDB container..."

  # Check if InfluxDB has been initialized before
  if docker volume inspect influxdb_volume >/dev/null 2>&1; then
    echo "Existing InfluxDB volume found, starting container..."
    docker run -d --rm --name influxdb \
      -p 8086:8086 \
      -v influxdb_volume:/var/lib/influxdb2 \
      -e INFLUXD_STORAGE_WAL_FSYNC_DELAY=0s \
      -e INFLUXD_HTTP_AUTH_ENABLED=false \
      -e INFLUXD_STORAGE_CACHE_SNAPSHOT_MEMORY_SIZE=0 \
      -e INFLUXD_STORAGE_CACHE_SNAPSHOT_WRITE_COLD_DURATION=0s \
      influxdb:2.7
  else
    echo "No existing InfluxDB setup found. Running initial setup..."
    docker run -d -p 8086:8086 -v influxdb_volume:/var/lib/influxdb2 \
      -e INFLUXD_HTTP_AUTH_ENABLED=false \
      -e INFLUXDB_REPORTING_DISABLED=true \
      -e DOCKER_INFLUXDB_INIT_MODE=setup \
      -e DOCKER_INFLUXDB_INIT_USERNAME=admin \
      -e DOCKER_INFLUXDB_INIT_PASSWORD=password \
      -e DOCKER_INFLUXDB_INIT_ORG=ucp-org \
      -e DOCKER_INFLUXDB_INIT_BUCKET=performance \
      -e DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=my-secret-token \
      influxdb:2.7
  fi
fi

check_influxdb_ready() {
  local attempts=0
  local max_attempts=2
  local delay=2 # seconds

  while [ $attempts -lt $max_attempts ]; do
    if check_container_running && docker exec influxdb influx ping >/dev/null 2>&1; then
      return 0 # InfluxDB is ready
    else
      attempts=$((attempts + 1))
      echo "InfluxDB not ready yet, attempt $attempts/$max_attempts. Waiting $delay seconds..."
      sleep $delay
    fi
  done

  return 1 # InfluxDB is not ready after max attempts
}

if docker ps --format '{{.Names}}' | grep -q "influxdb"; then
  if check_influxdb_ready; then
    echo "InfluxDB is ready."
    echo "Checking for testBucket..."
    if ! docker exec influxdb influx bucket list -o ucp-org -t my-secret-token | grep -q "testBucket"; then
      echo "Creating testBucket..."
      docker exec influxdb influx bucket create -n testBucket -o ucp-org -t my-secret-token
    else
      echo "testBucket already exists."
    fi
  else
    echo "InfluxDB did not become ready after multiple attempts."
  fi
else
  echo "InfluxDB is not running, cannot create testBucket."
fi
