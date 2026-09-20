import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Notification } from '../notifications/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DB_URL'),
        schema: configService.get<string>('DATABASE_SCHEMA') || 'public',
        entities: [Notification],
        // WARNING: synchronize should be set to false in production
        // Use migrations instead for production deployments
        synchronize: false,
        connectTimeoutMS: 5000,
        logging: false, //configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
