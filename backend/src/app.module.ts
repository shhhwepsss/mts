import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database/database.config';
import { jwtConfig } from './config/jwt/jwt.config';
import { googleConfig } from './config/google/google.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { MotorcycleModule } from './modules/motorcycle/motorcycle.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, googleConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (dbConfig: ConfigType<typeof databaseConfig>) => ({
        type: 'postgres',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        autoLoadEntities: true,
        synchronize: true, // dev only — use migrations in production
      }),
    }),
    UserModule,
    AuthModule,
    MotorcycleModule,
    MaintenanceModule,
  ],
})
export class AppModule {}
