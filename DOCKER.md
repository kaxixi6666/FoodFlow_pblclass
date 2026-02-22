# Docker Deployment Guide

This guide will help you deploy FoodFlow using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- OpenAI API Key (for ingredient recognition feature)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/kaxixi6666/FoodFlow_pblclass.git
cd FoodFlow_pblclass
```

### 2. Configure environment variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file and add your OpenAI API key
nano .env
```

Update the following variables in `.env`:
```
OPENAI_API_KEY=your-actual-openai-api-key
```

### 3. Start all services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api
- **PostgreSQL**: localhost:5432

## Services

### PostgreSQL Database
- **Container**: foodflow-postgres
- **Port**: 5432
- **Database**: foodflow
- **Username**: foodflow
- **Password**: foodflow123

### Backend Service
- **Container**: foodflow-backend
- **Port**: 8080
- **Context Path**: /api
- **Dependencies**: PostgreSQL

### Frontend Service
- **Container**: foodflow-frontend
- **Port**: 80
- **Dependencies**: Backend

## Docker Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop services and remove volumes
```bash
docker-compose down -v
```

### View logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f
```

### Rebuild services
```bash
# Rebuild specific service
docker-compose up -d --build backend

# Rebuild all services
docker-compose up -d --build
```

### Execute commands in containers
```bash
# Access backend container
docker-compose exec backend bash

# Access database container
docker-compose exec postgres psql -U foodflow -d foodflow

# Access frontend container
docker-compose exec frontend sh
```

## Troubleshooting

### Port conflicts

If ports are already in use, modify the ports in `docker-compose.yml`:

```yaml
services:
  postgres:
    ports:
      - "5433:5432"  # Change from 5432 to 5433
  
  backend:
    ports:
      - "8081:8080"  # Change from 8080 to 8081
  
  frontend:
    ports:
      - "8080:80"  # Change from 80 to 8080
```

### Database connection issues

Check if PostgreSQL is running:
```bash
docker-compose ps postgres
```

Check PostgreSQL logs:
```bash
docker-compose logs postgres
```

Test database connection:
```bash
docker-compose exec postgres psql -U foodflow -d foodflow -c "SELECT version();"
```

### Backend startup issues

Check backend logs:
```bash
docker-compose logs backend
```

Restart backend service:
```bash
docker-compose restart backend
```

### Frontend not loading

Check if frontend is running:
```bash
docker-compose ps frontend
```

Check nginx configuration:
```bash
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Clear Docker cache

If you experience build issues, clear the Docker cache:

```bash
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Remove all unused networks
docker network prune
```

## Production Deployment

### Security Considerations

1. **Change default passwords**: Update database credentials in `docker-compose.yml`
2. **Use secrets**: Use Docker secrets for sensitive data
3. **Enable HTTPS**: Use a reverse proxy with SSL/TLS
4. **Network isolation**: Use custom networks for better security
5. **Resource limits**: Set resource limits in `docker-compose.yml`

### Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
  
  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
  
  postgres:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Health Checks

Health checks are already configured in `docker-compose.yml`. Monitor service health:

```bash
docker-compose ps
```

### Backup and Restore

#### Backup database

```bash
docker-compose exec postgres pg_dump -U foodflow foodflow > backup.sql
```

#### Restore database

```bash
cat backup.sql | docker-compose exec -T postgres psql -U foodflow foodflow
```

#### Backup volumes

```bash
docker run --rm -v foodflow_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

## Development

### Run in development mode

For development, you can run services individually:

```bash
# Start only database
docker-compose up -d postgres

# Run backend locally
cd backend
mvn spring-boot:run

# Run frontend locally
npm run dev
```

### Hot reload

For development with hot reload, use volume mounts in `docker-compose.yml`:

```yaml
services:
  backend:
    volumes:
      - ./backend/src:/app/src
      - ./backend/pom.xml:/app/pom.xml
  
  frontend:
    volumes:
      - ./src:/app/src
```

## Monitoring

### View resource usage

```bash
docker stats
```

### View container logs

```bash
docker-compose logs -f --tail=100
```

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/kaxixi6666/FoodFlow_pblclass/issues)
- Review the [Implementation Guide](IMPLEMENTATION_GUIDE.md)
- Check Docker logs: `docker-compose logs`
