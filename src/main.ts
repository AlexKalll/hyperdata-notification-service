import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { CustomLoggerService } from './common/logger/logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(CustomLoggerService);
  logger.setContext('Bootstrap');

  // Enable CORS with origin from environment variable
  const corsOrigin = configService.get<string>('cors.origin') || '*';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set global prefix 'api'
  app.setGlobalPrefix('api');

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Notification Service API')
    .setDescription('Real-time notification service with WebSocket and REST API support')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('notifications', 'Notification management endpoints')
    .addTag('health', 'Health check endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Configure graceful shutdown hooks
  app.enableShutdownHooks();

  const port = configService.get<number>('port') || 3002;
  const environment = configService.get<string>('nodeEnv') || 'development';

  // Start HTTP server first
  await app.listen(port);

  logger.log(`🚀 Notification Service is running on port ${port}`);
  logger.log(`📦 Environment: ${environment}`);
  logger.log(`🌐 CORS enabled for origin: ${corsOrigin}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  logger.log(`💾 Database: ${configService.get<string>('database.host')}:${configService.get<number>('database.port')}`);

  // Connect microservice to RabbitMQ asynchronously (non-blocking)
  const rabbitMQHost = configService.get<string>('rabbitmq.host');
  const rabbitMQUsername = configService.get<string>('rabbitmq.username');

  if (rabbitMQHost && rabbitMQUsername) {
    try {
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqp://${rabbitMQUsername}:${configService.get<string>('rabbitmq.password')}@${rabbitMQHost}:${configService.get<number>('rabbitmq.port')}`,
          ],
          queue: configService.get<string>('rabbitmq.queue'),
          queueOptions: {
            durable: true,
          },
          socketOptions: {
            heartbeatIntervalInSeconds: 60,
            reconnectTimeInSeconds: 5,
          },
          prefetchCount: 10,
          // Manual acknowledgment for reliability
          noAck: false,
          // Disable automatic queue assertion to prevent reply queue issues
          isGlobalPrefetchCount: false,
          // CRITICAL: Disable reply queue to prevent creating extra queues
          noAssert: true,
        },
      });

      // Start microservices asynchronously without blocking
      app.startAllMicroservices()
        .then(() => {
          logger.log('✅ RabbitMQ microservice connected successfully');
          logger.logRabbitMQConnection('connected');
        })
        .catch((error) => {
          logger.warn('⚠️  Failed to connect RabbitMQ microservice. Service continues without RabbitMQ consumer.');
          logger.warn(`RabbitMQ error: ${error.message}`);
        });
    } catch (error) {
      logger.warn('⚠️  Failed to setup RabbitMQ microservice. Service continues without RabbitMQ consumer.');
      logger.warn(`RabbitMQ error: ${error.message}`);
    }
  } else {
    logger.warn('⚠️  RabbitMQ configuration not found. Service running without RabbitMQ consumer.');
  }
}
bootstrap();
