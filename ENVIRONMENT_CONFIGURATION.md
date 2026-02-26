# FoodFlow Environment Configuration

## Overview
This document describes the environment configuration for the FoodFlow application, including both local development and production environments.

## Backend Configuration

### Files Created/Modified
1. **`backend/src/main/resources/application-dev.yml`** - Development environment configuration
2. **`backend/src/main/resources/application-prod.yml`** - Production environment configuration
3. **`backend/start.sh`** - Start script for switching between environments

### Key Features
- **Development (dev)**: Local PostgreSQL (Docker), port 8080, DEBUG log level, SQL display enabled, hot reload
- **Production (prod)**: Remote PostgreSQL, port 80, INFO log level, SQL display disabled, environment variables for sensitive info

### Usage
```bash
# Start backend in development mode
./start.sh dev

# Start backend in production mode
# Note: Requires environment variables to be set first
./start.sh prod
```

## Frontend Configuration

### Files Created/Modified
1. **`frontend/.env.development`** - Development environment variables
2. **`frontend/.env.production`** - Production environment variables
3. **`frontend/src/app/config/axiosInstance.ts`** - API client configuration

### Key Features
- **Development (dev)**: Uses local backend at `http://localhost:8080/api`
- **Production (prod)**: Uses remote backend at `https://foodflow-pblclass.onrender.com/api`
- **Auto environment detection**: API client automatically uses the appropriate base URL based on the environment

### Usage
```bash
# Start frontend in development mode
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build
```

## Local Database Setup

### File Created
1. **`start-postgres.sh`** - Script to start PostgreSQL 15 container

### Usage
```bash
# Start PostgreSQL container
./start-postgres.sh

# Stop PostgreSQL container
docker stop foodflow-postgres

# Start PostgreSQL container
docker start foodflow-postgres
```

## Environment Variables

### Production Environment
The following environment variables must be set for production:
- `SPRING_DATASOURCE_URL` - PostgreSQL database URL
- `SPRING_DATASOURCE_USERNAME` - PostgreSQL username
- `SPRING_DATASOURCE_PASSWORD` - PostgreSQL password
- `JWT_SECRET` - JWT secret key
- `OPENAI_API_KEY` - OpenAI API key (optional)

### Development Environment
Development environment uses hardcoded values in `application-dev.yml`:
- Database: `foodflow`
- Username: `postgres`
- Password: `postgres`
- JWT Secret: `dev-secret-key-for-local-development-only`

## Optimization Notes

### Local Development Speed-up
1. **Docker for Local DB**: Uses Docker container for PostgreSQL, eliminating the need for local installation
2. **Hot Reload**: Enabled Spring Boot DevTools for automatic code reload
3. **SQL Display**: Enabled for easier debugging
4. **Debug Logging**: Enabled for detailed error messages
5. **Disabled Monitoring**: Disabled non-essential monitoring components

### Production Optimization
1. **Info Logging**: Reduced log level to INFO for better performance
2. **SQL Display Disabled**: Disabled SQL logging for security and performance
3. **Hot Reload Disabled**: Disabled DevTools for production
4. **Environment Variables**: Used for sensitive information
5. **Health Checks**: Enabled for production monitoring

## Deployment Workflow
1. **Local Development**: Use `./start.sh dev` for backend and `npm run dev` for frontend
2. **Production Deployment**: Set environment variables and use `./start.sh prod` for backend, `npm run build` for frontend

## Troubleshooting

### Local Database Issues
- Ensure Docker is running
- Check PostgreSQL container status: `docker ps`
- View PostgreSQL logs: `docker logs foodflow-postgres`

### Environment Switching
- Ensure the correct environment is specified when running `start.sh`
- Check that environment variables are set correctly for production

### API Connection Issues
- Verify that the backend is running on the correct port
- Check the API base URL in the environment files
- Ensure CORS is properly configured