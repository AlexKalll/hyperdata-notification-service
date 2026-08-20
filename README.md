# Notification Microservice

A real-time notification service built with NestJS that integrates with Mahder backend systems. The service consumes notification events from RabbitMQ, persists them in PostgreSQL, and delivers them to users via REST API.

## Features

- **RabbitMQ Integration**: Consumes notification events from message queue
- **Real-time Delivery**: Socket.IO gateway for instant notification push
- **PostgreSQL Storage**: Persistent notification history with efficient indexing
- **Health Checks**: Built-in health monitoring for dependencies
- **Docker Support**: Containerized deployment with optimized Dockerfile
- **CI/CD Pipeline**: Automated deployment with GitHub Actions

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [CI/CD Pipeline](#cicd-pipeline)
- [RabbitMQ Message Format](#rabbitmq-message-format)
- [Notification Types](#notification-types)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Architecture

```
┌─────────────────┐
│  Mahder Backend │
└────────┬────────┘
         │ Publish Events
         ▼
┌─────────────────┐
│    RabbitMQ     │
└────────┬────────┘
         │ Consume
         ▼
┌─────────────────────────────────┐
│   Notification Microservice     │
│  ┌──────────────────────────┐   │
│  │  RabbitMQ Consumer       │   │
│  └──────────┬───────────────┘   │
│             ▼                   │
│  ┌──────────────────────────┐   │
│  │  Notification Service    │   │
│  └──────────┬───────────────┘   │
│             ▼                   │
│  ┌──────────────────────────┐   │
│  │     PostgreSQL DB        │   │
│  └──────────────────────────┘   │
│             │                   │
└─────────────────────────────────┘
              │              
              ▼              
       ┌─────────────┐
       │Mobile Client│
       └─────────────┘
```

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 14+
- RabbitMQ 3.11+
- Docker and Docker Compose (optional)

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=notifications

# RabbitMQ Configuration
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_QUEUE=notifications.queue
RABBITMQ_EXCHANGE=notifications.exchange
RABBITMQ_ROUTING_KEY=notification.created

# JWT Configuration (must match Spring Boot backend)
JWT_SECRET=your-shared-secret-key

# CORS Configuration
CORS_ORIGIN=http://localhost:4200

# Logging
LOG_LEVEL=info
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_DATABASE` | Database name | `notifications` |
| `RABBITMQ_HOST` | RabbitMQ host | `localhost` |
| `RABBITMQ_PORT` | RabbitMQ port | `5672` |
| `RABBITMQ_USERNAME` | RabbitMQ username | `guest` |
| `RABBITMQ_PASSWORD` | RabbitMQ password | `guest` |
| `RABBITMQ_QUEUE` | Queue name | `notifications.queue` |
| `RABBITMQ_EXCHANGE` | Exchange name | `notifications.exchange` |
| `RABBITMQ_ROUTING_KEY` | Routing key | `notification.created` |
| `JWT_SECRET` | Shared JWT secret | `your-secret-key` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:4200` |
| `LOG_LEVEL` | Logging level | `info` |

### Logging Configuration

The service uses a structured logging system with correlation ID support for request tracing.

**Log Levels** (from least to most verbose):
- `error`: Only errors
- `warn`: Warnings and errors
- `info`: Informational messages, warnings, and errors (default)
- `debug`: Debug information and all above
- `verbose`: All log messages

**Log Format**:
- **Development**: Human-readable format with timestamps and context
- **Production**: JSON format for structured logging and log aggregation

**Correlation IDs**:
- Automatically generated for each HTTP request
- Can be provided via `x-correlation-id` header
- Included in all log entries for request tracing
- Propagated through the entire request lifecycle

**Key Events Logged**:
- Notification received from RabbitMQ
- Notification stored in database
- Notification emitted via Socket.IO
- RabbitMQ connection events (connected, disconnected, error)
- Database connection events (connected, disconnected, error)
- HTTP errors with status codes and stack traces

## Running the Application

### Local Development

```bash
# Development mode with hot reload
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

The service will be available at `http://localhost:3000` (or your configured PORT).

## CI/CD Pipeline

### Automated Deployment with GitHub Actions

The project includes a complete CI/CD pipeline that automatically builds and deploys your application.

**Workflow Triggers:**
- Push to `master` branch → Deploy to production (port 3000)
- Push to `staging` branch → Deploy to staging (port 3001)
- Manual trigger from GitHub Actions tab

**Deployment Process:**
1. Build Docker image
2. Push to Docker Hub
3. SSH to server
4. Pull and deploy new container
5. Verify health check

**Setup Instructions:**

1. **Configure GitHub Secrets** (see [.github/SECRETS_SETUP.md](.github/SECRETS_SETUP.md)):
   - Docker Hub credentials
   - SSH connection details
   - Environment variables for production and staging

2. **Push to deploy:**
   ```bash
   # Deploy to production
   git push origin master

   # Deploy to staging
   git push origin staging
   ```

3. **Monitor deployment:**
   - Go to Actions tab in GitHub
   - View workflow progress and logs
   - Check deployment status

**Documentation:**
- [CI/CD Setup Guide](.github/README.md) - Quick start
- [Secrets Configuration](.github/SECRETS_SETUP.md) - Detailed setup
- [Workflow Diagram](.github/WORKFLOW_DIAGRAM.md) - Visual flow

**Benefits:**
- ✅ Zero-downtime deployments
- ✅ Automatic health checks
- ✅ Environment-specific configurations
- ✅ Easy rollback capability
- ✅ Deployment history tracking

### Complete Example


## RabbitMQ Message Format

The Spring Boot backend should publish notification events to RabbitMQ in the following format:

### Exchange Configuration

- **Exchange Name**: `notifications.exchange` (configurable via `RABBITMQ_EXCHANGE`)
- **Exchange Type**: `topic` or `direct`
- **Routing Key**: `notification.created` (configurable via `RABBITMQ_ROUTING_KEY`)
- **Queue Name**: `notifications.queue` (configurable via `RABBITMQ_QUEUE`)

### Message Payload

```json
{
  "userId": "user-123",
  "notificationType": "SALE_COMPLETION",
  "displayName": "Sale Completion",
  "title":"title",
  "message":"message",
  "payload": {
    "saleId": "12345",
    "amount": 150.00,
    "customerName": "John Doe",
    "branchName": "Main Branch"
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | User ID to receive the notification |
| `notificationType` | string | Yes | One of the supported notification types (see below) |
| `displayName` | string | Yes | Human-readable notification name |
| `payload` | object | Yes | Custom data specific to the notification type |

```bash
# Unit tests
pnpm run test

# Unit tests with coverage
pnpm run test:cov

# E2E tests
pnpm run test:e2e

# Watch mode
pnpm run test:watch
```

## Production Deployment

### Quick Start

1. **Configure production environment:**
```bash
# Copy the template
cp .env.prod.example .env.prod

# Edit with your production values
# Update DB_HOST, RABBITMQ_HOST, JWT_SECRET, CORS_ORIGIN, etc.
```

2. **Build and run:**

**Linux/Mac:**
```bash
chmod +x build-and-run.sh
./build-and-run.sh
```

**Windows:**
```cmd
build-and-run.bat
```

**Manual Docker commands:**
```bash
# Build image
docker build -t notification-service:latest .

# Run container
docker run -d \
  --name notification-service \
  -p 3000:3000 \
  --env-file .env.prod \
  --restart unless-stopped \
  notification-service:latest
```

### Production Checklist

Before deploying to production:

- ✅ Update `.env.prod` with production credentials
- ✅ Use strong passwords for database and RabbitMQ
- ✅ Set secure JWT_SECRET (minimum 32 characters)
- ✅ Configure CORS_ORIGIN to your actual domain
- ✅ Set LOG_LEVEL to 'warn' or 'error'
- ✅ Ensure PostgreSQL and RabbitMQ are accessible
- ✅ Configure reverse proxy (Nginx/Apache) if needed
- ✅ Set up SSL/TLS certificates
- ✅ Configure firewall rules
- ✅ Set up monitoring and alerting

### Deployment Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive production deployment instructions including:
- Docker deployment options
- Health monitoring
- Scaling strategies
- Nginx reverse proxy configuration
- Troubleshooting guide
- Security best practices

## Troubleshooting

### Common Issues

#### 1. Cannot connect to RabbitMQ

**Error:** `Connection refused to RabbitMQ`

**Solution:**
- Verify RabbitMQ is running: `docker ps` or check service status
- Check `RABBITMQ_HOST` and `RABBITMQ_PORT` in `.env`
- Verify credentials are correct
- Check firewall settings

#### 2. Database connection failed

**Error:** `Unable to connect to the database`

**Solution:**
- Verify PostgreSQL is running
- Check `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` in `.env`
- Ensure database exists: `CREATE DATABASE notifications;`
- Check PostgreSQL logs for errors

#### 3. JWT authentication fails

**Error:** `401 Unauthorized`

**Solution:**
- Verify `JWT_SECRET` matches Spring Boot backend
- Check token format: `Bearer <token>`
- Verify token hasn't expired
- Check token payload contains `sub` or `userId` field

#### 4. Socket.IO connection rejected

**Error:** `Connection rejected`

**Solution:**
- Verify JWT token is provided in auth handshake or query
- Check CORS configuration in `.env`
- Verify client is connecting to correct URL and port

#### 5. Notifications not being received

**Solution:**
- Check RabbitMQ queue has messages: RabbitMQ Management UI
- Verify exchange and routing key configuration
- Check service logs for consumer errors
- Verify message format matches expected schema

### Logs

View application logs:

```bash
# Docker
docker-compose logs -f notification-service

# Local
# Logs are output to console in development mode
```

### Health Check

Check service health:

```bash
curl http://localhost:3000/api/health
```

## License

This project is licensed under the APACHE License.
