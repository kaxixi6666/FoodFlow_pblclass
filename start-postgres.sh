#!/bin/bash

# Start PostgreSQL 15 container for FoodFlow local development
echo "Starting PostgreSQL 15 container for FoodFlow..."

# Stop and remove existing container if it exists
docker stop foodflow-postgres 2>/dev/null || true
docker rm foodflow-postgres 2>/dev/null || true

# Start new PostgreSQL container
docker run -d \
  --name foodflow-postgres \
  -e POSTGRES_DB=foodflow \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -v foodflow-postgres-data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:15

echo "PostgreSQL 15 container started successfully!"
echo "Database: foodflow"
echo "Username: postgres"
echo "Password: postgres"
echo "Port: 5432"
echo ""
echo "To stop the container: docker stop foodflow-postgres"
echo "To start the container: docker start foodflow-postgres"
echo "To view logs: docker logs foodflow-postgres"
echo ""
echo "Waiting for PostgreSQL to be ready..."
sleep 5
echo "PostgreSQL is ready for use!"