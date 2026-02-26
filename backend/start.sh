#!/bin/bash

# Start script for FoodFlow backend
# Usage: ./start.sh [dev|prod]

# Default environment is dev
ENVIRONMENT=${1:-dev}

echo "Starting FoodFlow backend in $ENVIRONMENT environment..."

# Set environment variables based on environment
if [ "$ENVIRONMENT" = "dev" ]; then
    # Development environment settings
    export SPRING_PROFILES_ACTIVE=dev
    export PORT=8080
    export JWT_SECRET=dev-secret-key-for-local-development-only
    export OPENAI_API_KEY=
    
    echo "Development environment configured:"
    echo "- Using H2 in-memory database"
    echo "- Port: 8080"
    echo "- Debug logging enabled"
    echo "- SQL logging enabled"
    echo "- Hot reload enabled"
    
elif [ "$ENVIRONMENT" = "prod" ]; then
    # Production environment settings
    export SPRING_PROFILES_ACTIVE=prod
    export PORT=80
    
    # Check if required environment variables are set
    if [ -z "$SPRING_DATASOURCE_URL" ]; then
        echo "Error: SPRING_DATASOURCE_URL is not set for production"
        exit 1
    fi
    
    if [ -z "$SPRING_DATASOURCE_USERNAME" ]; then
        echo "Error: SPRING_DATASOURCE_USERNAME is not set for production"
        exit 1
    fi
    
    if [ -z "$SPRING_DATASOURCE_PASSWORD" ]; then
        echo "Error: SPRING_DATASOURCE_PASSWORD is not set for production"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        echo "Error: JWT_SECRET is not set for production"
        exit 1
    fi
    
    echo "Production environment configured:"
    echo "- Using remote PostgreSQL"
    echo "- Port: 80"
    echo "- Info logging enabled"
    echo "- SQL logging disabled"
    echo "- Hot reload disabled"
else
    echo "Error: Invalid environment. Use 'dev' or 'prod'"
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")"

# Build and run the application
echo "Building application..."
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "Starting application..."
    java -jar target/foodflow-*.jar
else
    echo "Build failed!"
    exit 1
fi