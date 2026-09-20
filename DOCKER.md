# Docker Deployment Guide

This guide explains how to build and run the notification service using Docker.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+ (optional, for orchestration)

## Building the Docker Image

### Build the image

```bash
docker build -t notification-service:latest .
```

### Build with specific tag

```bash
docker build -t notification-service:1.0.0 .
```

## Running the Container

### Run with environment variables

```bash
docker run -d \
  --name notification-service \
  -p 3002:3002 \
  -e DB_HOST=your-postgres-host \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=your-password \
  -e DB_DATABASE=notifications \
  -e DB_URL=postgresql://postgres:your-password@your-postgres-host:5432/notifications \
  -e DATABASE_SCHEMA=public \
  -e RABBITMQ_HOST=your-rabbitmq-host \
  -e RABBITMQ_PORT=5672 \
  -e RABBITMQ_USERNAME=guest \
  -e RABBITMQ_PASSWORD=guest \
  -e RABBITMQ_QUEUE=notifications.queue \
  -e RABBITMQ_EXCHANGE=notifications.exchange \
  -e RABBITMQ_ROUTING_KEY=notification.created \
  -e JWT_SECRET=your-shared-secret \
  -e CORS_ORIGIN=http://localhost:4200 \
  notification-service:latest
```

### Run with .env file

Create a `.env` file with your configuration:

```env
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_DATABASE=notifications
DB_URL=postgresql://postgres:your-password@your-postgres-host:5432/notifications
DATABASE_SCHEMA=public
RABBITMQ_HOST=your-rabbitmq-host
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_QUEUE=notifications.queue
RABBITMQ_EXCHANGE=notifications.exchange
RABBITMQ_ROUTING_KEY=notification.created
JWT_SECRET=your-shared-secret
CORS_ORIGIN=http://localhost:4200
```

Then run:

```bash
docker run -d \
  --name notification-service \
  -p 3002:3002 \
  --env-file .env \
  notification-service:latest
```

## Using Docker Compose

### Local Development (with PostgreSQL and RabbitMQ)

This will start the notification service along with PostgreSQL and RabbitMQ containers:

```bash
docker-compose up -d
```

Stop the services:

```bash
docker-compose down
```

Stop and remove volumes:

```bash
docker-compose down -v
```

### Hyperdata local backend network

The local `D:\@hyperdata\hyperdata-notification-service\.env` is configured to
reuse the backend's `mahder_db` and notification table. Run the service on the
same Docker network so `mahder_postgres` and
`hyperdata-backend-rabbitmq-1` resolve:

```bash
docker build -t hyperdata-notification:local .
docker run --rm --name hyperdata-notification-service \
  --network hyperdata-backend_backend_network \
  --env-file .env \
  -p 3002:3002 \
  hyperdata-notification:local
```

This shared-database arrangement is for the current local E2E checkout. Use a
separate `notifications` database in production when the backend notification
read API is moved behind a service boundary.

### Production (External Services)

For production with external PostgreSQL and RabbitMQ:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Make sure to set the required environment variables in a `.env` file or export them before running.

## Health Check

The container includes a built-in health check that runs every 30 seconds:

```bash
# Check container health status
docker ps

# View health check logs
docker inspect --format='{{json .State.Health}}' notification-service
```

You can also manually check the health endpoint:

```bash
curl http://localhost:3002/health
```

## Viewing Logs

```bash
# View logs
docker logs notification-service

# Follow logs
docker logs -f notification-service

# View last 100 lines
docker logs --tail 100 notification-service
```

## Stopping and Removing

```bash
# Stop the container
docker stop notification-service

# Remove the container
docker rm notification-service

# Stop and remove in one command
docker rm -f notification-service
```

## Multi-Stage Build Details

The Dockerfile uses a multi-stage build for optimization:

1. **Builder Stage**: Installs all dependencies and builds the TypeScript code
2. **Production Stage**: Only includes production dependencies and the compiled code

This results in a smaller final image size and improved security.

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3002 | Application port |
| NODE_ENV | No | production | Node environment |
| DB_HOST | Yes | - | PostgreSQL host |
| DB_PORT | Yes | - | PostgreSQL port |
| DB_USERNAME | Yes | - | PostgreSQL username |
| DB_PASSWORD | Yes | - | PostgreSQL password |
| DB_DATABASE | Yes | - | PostgreSQL database name |
| DB_URL | Yes | - | PostgreSQL connection URL used by TypeORM |
| DATABASE_SCHEMA | Yes | public | PostgreSQL schema used by TypeORM |
| RABBITMQ_HOST | Yes | - | RabbitMQ host |
| RABBITMQ_PORT | Yes | - | RabbitMQ port |
| RABBITMQ_USERNAME | Yes | - | RabbitMQ username |
| RABBITMQ_PASSWORD | Yes | - | RabbitMQ password |
| RABBITMQ_QUEUE | Yes | - | RabbitMQ queue name |
| RABBITMQ_EXCHANGE | Yes | - | RabbitMQ exchange name |
| RABBITMQ_ROUTING_KEY | Yes | - | RabbitMQ routing key |
| JWT_SECRET | Yes | - | JWT secret (shared with Spring Boot) |
| CORS_ORIGIN | No | * | CORS allowed origin |
| LOG_LEVEL | No | info | Logging level |

## Troubleshooting

### Container fails to start

Check the logs:
```bash
docker logs notification-service
```

Common issues:
- Missing required environment variables
- Cannot connect to PostgreSQL or RabbitMQ
- Invalid JWT_SECRET

### Health check failing

The health check verifies:
- Application is responding on port 3002
- Database connection is healthy
- RabbitMQ connection is healthy

Check the health endpoint manually:
```bash
docker exec notification-service wget -qO- http://localhost:3002/health
```

### Cannot connect to external services

Ensure:
- PostgreSQL and RabbitMQ are accessible from the container
- Network connectivity is properly configured
- Firewall rules allow connections
- Credentials are correct

## Security Best Practices

1. **Never commit secrets**: Use environment variables or secrets management
2. **Use non-root user**: The container runs as user `nestjs` (UID 1001)
3. **Keep base image updated**: Regularly update the Node.js base image
4. **Scan for vulnerabilities**: Use `docker scan notification-service:latest`
5. **Use specific versions**: Pin dependency versions in package.json

## Production Deployment

For production deployments, consider:

1. **Use orchestration**: Kubernetes, Docker Swarm, or ECS
2. **Implement secrets management**: AWS Secrets Manager, HashiCorp Vault
3. **Set up monitoring**: Prometheus, Grafana, CloudWatch
4. **Configure log aggregation**: ELK stack, CloudWatch Logs
5. **Enable auto-scaling**: Based on CPU/memory or custom metrics
6. **Use load balancer**: For multiple instances
7. **Implement CI/CD**: Automated builds and deployments
