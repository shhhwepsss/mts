# MTS Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the NestJS backend with PostgreSQL, DDD and pragmatic hexagonal architecture for the motorcycle maintenance tracking system.

**Architecture:** Pragmatic hexagonal with domain entities separate from ORM entities. Ports defined in domain layer, adapters in infrastructure. Use cases orchestrate domain logic, controllers are thin HTTP adapters.

**Tech Stack:** NestJS 10, TypeORM 0.3, PostgreSQL, @nestjs/jwt, passport-jwt, google-auth-library, class-validator, class-transformer, uuid

---

## Task 1: Project Scaffolding & Database Config

**Files:**
- Create: `backend/` (NestJS project)
- Create: `backend/src/config/app.config.ts`
- Create: `backend/.env`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create NestJS project**

```bash
cd /home/user/projects/mts
npx @nestjs/cli new backend --package-manager yarn --skip-git
```

- [ ] **Step 2: Install dependencies**

```bash
cd /home/user/projects/mts/backend
yarn add @nestjs/config @nestjs/typeorm typeorm pg @nestjs/jwt @nestjs/passport passport passport-jwt google-auth-library class-validator class-transformer uuid
yarn add -D @types/passport-jwt @types/uuid
```

- [ ] **Step 3: Create .env**

```env
# backend/.env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=mts
JWT_ACCESS_SECRET=mts-access-secret-change-me
JWT_REFRESH_SECRET=mts-refresh-secret-change-me
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
GOOGLE_CLIENT_ID=your-google-client-id
```

- [ ] **Step 4: Create app.config.ts**

```typescript
// backend/src/config/app.config.ts
import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'mts',
}));

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));

export const googleConfig = registerAs('google', () => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
}));
```

- [ ] **Step 5: Update app.module.ts**

```typescript
// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig, jwtConfig, googleConfig } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, googleConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        autoLoadEntities: true,
        synchronize: true, // dev only — use migrations in production
      }),
    }),
  ],
})
export class AppModule {}
```

- [ ] **Step 6: Enable validation pipe in main.ts**

```typescript
// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
```

- [ ] **Step 7: Verify it starts**

Run: `cd /home/user/projects/mts/backend && yarn start:dev`
Expected: NestJS starts on port 3000 (DB connection may fail if PostgreSQL not running — that's OK for now)

- [ ] **Step 8: Commit**

```bash
git add backend/
git commit -m "feat(backend): scaffold NestJS project with TypeORM and config"
```

---

## Task 2: Shared Domain Layer

**Files:**
- Create: `backend/src/shared/domain/base.entity.ts`
- Create: `backend/src/shared/domain/exceptions.ts`
- Create: `backend/src/shared/infrastructure/filters/domain-exception.filter.ts`
- Test: `backend/src/shared/domain/base.entity.spec.ts`
- Test: `backend/src/shared/domain/exceptions.spec.ts`

- [ ] **Step 1: Write test for BaseEntity**

```typescript
// backend/src/shared/domain/base.entity.spec.ts
import { BaseEntity } from './base.entity';

class TestEntity extends BaseEntity {
  constructor(id?: string) {
    super(id);
  }
}

describe('BaseEntity', () => {
  it('should generate a UUID if none provided', () => {
    const entity = new TestEntity();
    expect(entity.id).toBeDefined();
    expect(entity.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should use provided id', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const entity = new TestEntity(id);
    expect(entity.id).toBe(id);
  });

  it('should set createdAt and updatedAt', () => {
    const entity = new TestEntity();
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/user/projects/mts/backend && npx jest src/shared/domain/base.entity.spec.ts --verbose`
Expected: FAIL — Cannot find module './base.entity'

- [ ] **Step 3: Implement BaseEntity**

```typescript
// backend/src/shared/domain/base.entity.ts
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(id?: string) {
    this.id = id ?? uuidv4();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/user/projects/mts/backend && npx jest src/shared/domain/base.entity.spec.ts --verbose`
Expected: PASS — 3 tests

- [ ] **Step 5: Write test for domain exceptions**

```typescript
// backend/src/shared/domain/exceptions.spec.ts
import {
  DomainException,
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from './exceptions';

describe('Domain Exceptions', () => {
  it('DomainException has message and code', () => {
    const error = new DomainException('something broke', 'DOMAIN_ERROR');
    expect(error.message).toBe('something broke');
    expect(error.code).toBe('DOMAIN_ERROR');
  });

  it('ValidationException defaults code to VALIDATION_ERROR', () => {
    const error = new ValidationException('invalid input');
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('NotFoundException defaults code to NOT_FOUND', () => {
    const error = new NotFoundException('user not found');
    expect(error.code).toBe('NOT_FOUND');
  });

  it('ForbiddenException defaults code to FORBIDDEN', () => {
    const error = new ForbiddenException('not allowed');
    expect(error.code).toBe('FORBIDDEN');
  });
});
```

- [ ] **Step 6: Implement domain exceptions**

```typescript
// backend/src/shared/domain/exceptions.ts
export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string = 'DOMAIN_ERROR',
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class NotFoundException extends DomainException {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
  }
}

export class ForbiddenException extends DomainException {
  constructor(message: string) {
    super(message, 'FORBIDDEN');
  }
}
```

- [ ] **Step 7: Run exception tests**

Run: `cd /home/user/projects/mts/backend && npx jest src/shared/domain/exceptions.spec.ts --verbose`
Expected: PASS — 4 tests

- [ ] **Step 8: Create domain exception filter**

```typescript
// backend/src/shared/infrastructure/filters/domain-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainException,
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from '../../domain/exceptions';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    if (exception instanceof ValidationException) {
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof NotFoundException) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof ForbiddenException) {
      status = HttpStatus.FORBIDDEN;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    response.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
    });
  }
}
```

- [ ] **Step 9: Register filter globally in main.ts**

Add to `bootstrap()` in `backend/src/main.ts`, after `useGlobalPipes`:

```typescript
import { DomainExceptionFilter } from './shared/infrastructure/filters/domain-exception.filter';

// inside bootstrap(), after useGlobalPipes:
app.useGlobalFilters(new DomainExceptionFilter());
```

- [ ] **Step 10: Commit**

```bash
git add backend/src/shared/
git commit -m "feat(backend): add shared domain layer — BaseEntity, exceptions, exception filter"
```

---

## Task 3: User Module

**Files:**
- Create: `backend/src/modules/user/domain/entities/user.entity.ts`
- Create: `backend/src/modules/user/domain/ports/user-repository.port.ts`
- Create: `backend/src/modules/user/infrastructure/persistence/user.orm-entity.ts`
- Create: `backend/src/modules/user/infrastructure/persistence/user.mapper.ts`
- Create: `backend/src/modules/user/infrastructure/persistence/user.repository.ts`
- Create: `backend/src/modules/user/application/use-cases/get-user-profile.use-case.ts`
- Create: `backend/src/modules/user/application/use-cases/update-user-profile.use-case.ts`
- Create: `backend/src/modules/user/infrastructure/controllers/user.controller.ts`
- Create: `backend/src/modules/user/user.module.ts`
- Test: `backend/src/modules/user/domain/entities/user.entity.spec.ts`

- [ ] **Step 1: Write test for User domain entity**

```typescript
// backend/src/modules/user/domain/entities/user.entity.spec.ts
import { User } from './user.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

describe('User Entity', () => {
  it('should create a valid user', () => {
    const user = new User({ name: 'John Doe', email: 'john@example.com' });
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.id).toBeDefined();
  });

  it('should reject empty name', () => {
    expect(() => new User({ name: '', email: 'john@example.com' })).toThrow(
      ValidationException,
    );
  });

  it('should reject name longer than 100 characters', () => {
    const longName = 'a'.repeat(101);
    expect(
      () => new User({ name: longName, email: 'john@example.com' }),
    ).toThrow(ValidationException);
  });

  it('should reject empty email', () => {
    expect(() => new User({ name: 'John', email: '' })).toThrow(
      ValidationException,
    );
  });

  it('should reject invalid email format', () => {
    expect(() => new User({ name: 'John', email: 'not-an-email' })).toThrow(
      ValidationException,
    );
  });

  it('should reject email longer than 100 characters', () => {
    const longEmail = 'a'.repeat(90) + '@example.com';
    expect(() => new User({ name: 'John', email: longEmail })).toThrow(
      ValidationException,
    );
  });

  it('should allow optional avatarUrl', () => {
    const user = new User({
      name: 'John',
      email: 'john@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
    });
    expect(user.avatarUrl).toBe('https://example.com/avatar.jpg');
  });

  it('should update name', () => {
    const user = new User({ name: 'John', email: 'john@example.com' });
    user.updateName('Jane');
    expect(user.name).toBe('Jane');
  });

  it('should reject updating to empty name', () => {
    const user = new User({ name: 'John', email: 'john@example.com' });
    expect(() => user.updateName('')).toThrow(ValidationException);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/user/projects/mts/backend && npx jest src/modules/user/domain/entities/user.entity.spec.ts --verbose`
Expected: FAIL — Cannot find module './user.entity'

- [ ] **Step 3: Implement User domain entity**

```typescript
// backend/src/modules/user/domain/entities/user.entity.ts
import { BaseEntity } from '../../../../shared/domain/base.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

interface UserProps {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends BaseEntity {
  private _name: string;
  private _email: string;
  private _avatarUrl: string | null;

  constructor(props: UserProps) {
    super(props.id);
    this.validateName(props.name);
    this.validateEmail(props.email);
    this._name = props.name;
    this._email = props.email;
    this._avatarUrl = props.avatarUrl ?? null;
    if (props.createdAt) (this as any).createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  updateName(name: string): void {
    this.validateName(name);
    this._name = name;
    this.updatedAt = new Date();
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationException('Name must not be empty');
    }
    if (name.length > 100) {
      throw new ValidationException('Name must not exceed 100 characters');
    }
  }

  private validateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new ValidationException('Email must not be empty');
    }
    if (email.length > 100) {
      throw new ValidationException('Email must not exceed 100 characters');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationException('Email format is invalid');
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/user/projects/mts/backend && npx jest src/modules/user/domain/entities/user.entity.spec.ts --verbose`
Expected: PASS — 9 tests

- [ ] **Step 5: Create UserRepository port**

```typescript
// backend/src/modules/user/domain/ports/user-repository.port.ts
import { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
```

- [ ] **Step 6: Create User ORM entity**

```typescript
// backend/src/modules/user/infrastructure/persistence/user.orm-entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

- [ ] **Step 7: Create User mapper**

```typescript
// backend/src/modules/user/infrastructure/persistence/user.mapper.ts
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from './user.orm-entity';

export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return new User({
      id: orm.id,
      name: orm.name,
      email: orm.email,
      avatarUrl: orm.avatarUrl ?? undefined,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.email = domain.email;
    orm.avatarUrl = domain.avatarUrl;
    return orm;
  }
}
```

- [ ] **Step 8: Create User repository**

```typescript
// backend/src/modules/user/infrastructure/persistence/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from './user.orm-entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { email } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async save(user: User): Promise<User> {
    const orm = UserMapper.toOrm(user);
    const saved = await this.repo.save(orm);
    return UserMapper.toDomain(saved);
  }
}
```

- [ ] **Step 9: Create use cases**

```typescript
// backend/src/modules/user/application/use-cases/get-user-profile.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user-repository.port';
import { NotFoundException } from '../../../../shared/domain/exceptions';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
```

```typescript
// backend/src/modules/user/application/use-cases/update-user-profile.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user-repository.port';
import { NotFoundException } from '../../../../shared/domain/exceptions';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(userId: string, name: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.updateName(name);
    return this.userRepo.save(user);
  }
}
```

- [ ] **Step 10: Create UserController**

```typescript
// backend/src/modules/user/infrastructure/controllers/user.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

@Controller('users')
export class UserController {
  constructor(
    private readonly getUserProfile: GetUserProfileUseCase,
    private readonly updateUserProfile: UpdateUserProfileUseCase,
  ) {}

  @Get('me')
  async getProfile(@Req() req: any) {
    const user = await this.getUserProfile.execute(req.user.id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
  }

  @Patch('me')
  async updateProfile(@Req() req: any, @Body() dto: UpdateUserDto) {
    const user = await this.updateUserProfile.execute(req.user.id, dto.name);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
  }
}
```

- [ ] **Step 11: Create user.module.ts**

```typescript
// backend/src/modules/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { USER_REPOSITORY } from './domain/ports/user-repository.port';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';
import { UserController } from './infrastructure/controllers/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UserController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
```

- [ ] **Step 12: Register UserModule in AppModule**

Add to imports in `backend/src/app.module.ts`:

```typescript
import { UserModule } from './modules/user/user.module';

// add to imports array:
UserModule,
```

- [ ] **Step 13: Commit**

```bash
git add backend/src/modules/user/ backend/src/app.module.ts
git commit -m "feat(backend): add User module — domain entity, repository, use cases, controller"
```

---

## Task 4: Auth Module

**Files:**
- Create: `backend/src/modules/auth/domain/entities/google-provider.entity.ts`
- Create: `backend/src/modules/auth/domain/ports/google-provider-repository.port.ts`
- Create: `backend/src/modules/auth/infrastructure/persistence/google-provider.orm-entity.ts`
- Create: `backend/src/modules/auth/infrastructure/persistence/google-provider.mapper.ts`
- Create: `backend/src/modules/auth/infrastructure/persistence/google-provider.repository.ts`
- Create: `backend/src/modules/auth/application/services/jwt-token.service.ts`
- Create: `backend/src/modules/auth/application/use-cases/google-login.use-case.ts`
- Create: `backend/src/modules/auth/application/use-cases/refresh-token.use-case.ts`
- Create: `backend/src/modules/auth/infrastructure/controllers/auth.controller.ts`
- Create: `backend/src/modules/auth/infrastructure/guards/jwt-auth.guard.ts`
- Create: `backend/src/modules/auth/infrastructure/strategies/jwt.strategy.ts`
- Create: `backend/src/modules/auth/auth.module.ts`
- Test: `backend/src/modules/auth/domain/entities/google-provider.entity.spec.ts`
- Test: `backend/src/modules/auth/application/use-cases/google-login.use-case.spec.ts`

- [ ] **Step 1: Write test for GoogleProvider entity**

```typescript
// backend/src/modules/auth/domain/entities/google-provider.entity.spec.ts
import { GoogleProvider } from './google-provider.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

describe('GoogleProvider Entity', () => {
  it('should create a valid google provider', () => {
    const provider = new GoogleProvider({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      googleUserId: 'google-123',
      googleEmail: 'john@gmail.com',
    });
    expect(provider.googleUserId).toBe('google-123');
    expect(provider.googleEmail).toBe('john@gmail.com');
  });

  it('should reject empty googleUserId', () => {
    expect(
      () =>
        new GoogleProvider({
          userId: '123',
          googleUserId: '',
          googleEmail: 'john@gmail.com',
        }),
    ).toThrow(ValidationException);
  });

  it('should reject empty googleEmail', () => {
    expect(
      () =>
        new GoogleProvider({
          userId: '123',
          googleUserId: 'google-123',
          googleEmail: '',
        }),
    ).toThrow(ValidationException);
  });

  it('should allow optional googleAvatarUrl', () => {
    const provider = new GoogleProvider({
      userId: '123',
      googleUserId: 'google-123',
      googleEmail: 'john@gmail.com',
      googleAvatarUrl: 'https://lh3.googleusercontent.com/photo.jpg',
    });
    expect(provider.googleAvatarUrl).toBe(
      'https://lh3.googleusercontent.com/photo.jpg',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/user/projects/mts/backend && npx jest src/modules/auth/domain/entities/google-provider.entity.spec.ts --verbose`
Expected: FAIL — Cannot find module

- [ ] **Step 3: Implement GoogleProvider entity**

```typescript
// backend/src/modules/auth/domain/entities/google-provider.entity.ts
import { BaseEntity } from '../../../../shared/domain/base.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

interface GoogleProviderProps {
  id?: string;
  userId: string;
  googleUserId: string;
  googleEmail: string;
  googleAvatarUrl?: string;
  createdAt?: Date;
}

export class GoogleProvider extends BaseEntity {
  readonly userId: string;
  readonly googleUserId: string;
  readonly googleEmail: string;
  readonly googleAvatarUrl: string | null;

  constructor(props: GoogleProviderProps) {
    super(props.id);
    if (!props.googleUserId || props.googleUserId.trim().length === 0) {
      throw new ValidationException('Google user ID must not be empty');
    }
    if (!props.googleEmail || props.googleEmail.trim().length === 0) {
      throw new ValidationException('Google email must not be empty');
    }
    this.userId = props.userId;
    this.googleUserId = props.googleUserId;
    this.googleEmail = props.googleEmail;
    this.googleAvatarUrl = props.googleAvatarUrl ?? null;
    if (props.createdAt) (this as any).createdAt = props.createdAt;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/user/projects/mts/backend && npx jest src/modules/auth/domain/entities/google-provider.entity.spec.ts --verbose`
Expected: PASS — 4 tests

- [ ] **Step 5: Create GoogleProviderRepository port**

```typescript
// backend/src/modules/auth/domain/ports/google-provider-repository.port.ts
import { GoogleProvider } from '../entities/google-provider.entity';

export const GOOGLE_PROVIDER_REPOSITORY = Symbol('GOOGLE_PROVIDER_REPOSITORY');

export interface GoogleProviderRepositoryPort {
  findByGoogleUserId(googleUserId: string): Promise<GoogleProvider | null>;
  findByUserId(userId: string): Promise<GoogleProvider | null>;
  save(provider: GoogleProvider): Promise<GoogleProvider>;
}
```

- [ ] **Step 6: Create ORM entity, mapper, repository**

```typescript
// backend/src/modules/auth/infrastructure/persistence/google-provider.orm-entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('google_providers')
export class GoogleProviderOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'google_user_id', unique: true })
  googleUserId: string;

  @Column({ name: 'google_email' })
  googleEmail: string;

  @Column({ name: 'google_avatar_url', nullable: true })
  googleAvatarUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

```typescript
// backend/src/modules/auth/infrastructure/persistence/google-provider.mapper.ts
import { GoogleProvider } from '../../domain/entities/google-provider.entity';
import { GoogleProviderOrmEntity } from './google-provider.orm-entity';

export class GoogleProviderMapper {
  static toDomain(orm: GoogleProviderOrmEntity): GoogleProvider {
    return new GoogleProvider({
      id: orm.id,
      userId: orm.userId,
      googleUserId: orm.googleUserId,
      googleEmail: orm.googleEmail,
      googleAvatarUrl: orm.googleAvatarUrl ?? undefined,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: GoogleProvider): GoogleProviderOrmEntity {
    const orm = new GoogleProviderOrmEntity();
    orm.id = domain.id;
    orm.userId = domain.userId;
    orm.googleUserId = domain.googleUserId;
    orm.googleEmail = domain.googleEmail;
    orm.googleAvatarUrl = domain.googleAvatarUrl;
    return orm;
  }
}
```

```typescript
// backend/src/modules/auth/infrastructure/persistence/google-provider.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleProviderRepositoryPort } from '../../domain/ports/google-provider-repository.port';
import { GoogleProvider } from '../../domain/entities/google-provider.entity';
import { GoogleProviderOrmEntity } from './google-provider.orm-entity';
import { GoogleProviderMapper } from './google-provider.mapper';

@Injectable()
export class GoogleProviderRepository implements GoogleProviderRepositoryPort {
  constructor(
    @InjectRepository(GoogleProviderOrmEntity)
    private readonly repo: Repository<GoogleProviderOrmEntity>,
  ) {}

  async findByGoogleUserId(googleUserId: string): Promise<GoogleProvider | null> {
    const orm = await this.repo.findOne({ where: { googleUserId } });
    return orm ? GoogleProviderMapper.toDomain(orm) : null;
  }

  async findByUserId(userId: string): Promise<GoogleProvider | null> {
    const orm = await this.repo.findOne({ where: { userId } });
    return orm ? GoogleProviderMapper.toDomain(orm) : null;
  }

  async save(provider: GoogleProvider): Promise<GoogleProvider> {
    const orm = GoogleProviderMapper.toOrm(provider);
    const saved = await this.repo.save(orm);
    return GoogleProviderMapper.toDomain(saved);
  }
}
```

- [ ] **Step 7: Create JwtTokenService**

```typescript
// backend/src/modules/auth/application/services/jwt-token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokenPair(userId: string): Promise<TokenPair> {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.accessSecret'),
        expiresIn: this.configService.get('jwt.accessExpiration'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiration'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(token: string): Promise<{ sub: string }> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get('jwt.refreshSecret'),
    });
  }
}
```

- [ ] **Step 8: Create GoogleLoginUseCase**

```typescript
// backend/src/modules/auth/application/use-cases/google-login.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import {
  GOOGLE_PROVIDER_REPOSITORY,
  GoogleProviderRepositoryPort,
} from '../../domain/ports/google-provider-repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../user/domain/ports/user-repository.port';
import { GoogleProvider } from '../../domain/entities/google-provider.entity';
import { User } from '../../../user/domain/entities/user.entity';
import { JwtTokenService, TokenPair } from '../services/jwt-token.service';
import { ValidationException } from '../../../../shared/domain/exceptions';

@Injectable()
export class GoogleLoginUseCase {
  private readonly oauthClient: OAuth2Client;

  constructor(
    @Inject(GOOGLE_PROVIDER_REPOSITORY)
    private readonly providerRepo: GoogleProviderRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
    private readonly jwtTokenService: JwtTokenService,
    configService: ConfigService,
  ) {
    this.oauthClient = new OAuth2Client(configService.get('google.clientId'));
  }

  async execute(googleToken: string): Promise<TokenPair> {
    const ticket = await this.oauthClient.verifyIdToken({
      idToken: googleToken,
      audience: this.oauthClient._clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      throw new ValidationException('Invalid Google token');
    }

    const existing = await this.providerRepo.findByGoogleUserId(payload.sub);
    if (existing) {
      return this.jwtTokenService.generateTokenPair(existing.userId);
    }

    const user = new User({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      avatarUrl: payload.picture,
    });
    const savedUser = await this.userRepo.save(user);

    const provider = new GoogleProvider({
      userId: savedUser.id,
      googleUserId: payload.sub,
      googleEmail: payload.email,
      googleAvatarUrl: payload.picture,
    });
    await this.providerRepo.save(provider);

    return this.jwtTokenService.generateTokenPair(savedUser.id);
  }
}
```

- [ ] **Step 9: Create RefreshTokenUseCase**

```typescript
// backend/src/modules/auth/application/use-cases/refresh-token.use-case.ts
import { Injectable } from '@nestjs/common';
import { JwtTokenService, TokenPair } from '../services/jwt-token.service';
import { ValidationException } from '../../../../shared/domain/exceptions';

@Injectable()
export class RefreshTokenUseCase {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  async execute(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = await this.jwtTokenService.verifyRefreshToken(refreshToken);
      return this.jwtTokenService.generateTokenPair(payload.sub);
    } catch {
      throw new ValidationException('Invalid or expired refresh token');
    }
  }
}
```

- [ ] **Step 10: Create JWT strategy and guard**

```typescript
// backend/src/modules/auth/infrastructure/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.accessSecret'),
    });
  }

  async validate(payload: { sub: string }) {
    return { id: payload.sub };
  }
}
```

```typescript
// backend/src/modules/auth/infrastructure/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

- [ ] **Step 11: Create AuthController**

```typescript
// backend/src/modules/auth/infrastructure/controllers/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { GoogleLoginUseCase } from '../../application/use-cases/google-login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { IsString, IsNotEmpty } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly googleLogin: GoogleLoginUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
  ) {}

  @Post('google')
  async loginWithGoogle(@Body() dto: GoogleLoginDto) {
    return this.googleLogin.execute(dto.token);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshToken.execute(dto.refreshToken);
  }
}
```

- [ ] **Step 12: Create auth.module.ts**

```typescript
// backend/src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleProviderOrmEntity } from './infrastructure/persistence/google-provider.orm-entity';
import { GoogleProviderRepository } from './infrastructure/persistence/google-provider.repository';
import { GOOGLE_PROVIDER_REPOSITORY } from './domain/ports/google-provider-repository.port';
import { JwtTokenService } from './application/services/jwt-token.service';
import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoogleProviderOrmEntity]),
    JwtModule.register({}),
    PassportModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    { provide: GOOGLE_PROVIDER_REPOSITORY, useClass: GoogleProviderRepository },
    JwtTokenService,
    GoogleLoginUseCase,
    RefreshTokenUseCase,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
```

- [ ] **Step 13: Register AuthModule in AppModule and add global guard to UserController**

Add to imports in `backend/src/app.module.ts`:

```typescript
import { AuthModule } from './modules/auth/auth.module';

// add to imports array:
AuthModule,
```

Add `@UseGuards(JwtAuthGuard)` to UserController:

```typescript
// At top of user.controller.ts, add:
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  // ... existing code
}
```

- [ ] **Step 14: Commit**

```bash
git add backend/src/modules/auth/ backend/src/modules/user/infrastructure/controllers/user.controller.ts backend/src/app.module.ts
git commit -m "feat(backend): add Auth module — Google login, JWT, guards"
```

---

## Task 5: Motorcycle Module — Domain

**Files:**
- Create: `backend/src/modules/motorcycle/domain/entities/motorcycle.entity.ts`
- Create: `backend/src/modules/motorcycle/domain/enums/motorcycle-type.enum.ts`
- Create: `backend/src/modules/motorcycle/domain/ports/motorcycle-repository.port.ts`
- Test: `backend/src/modules/motorcycle/domain/entities/motorcycle.entity.spec.ts`

- [ ] **Step 1: Create MotorcycleTypeEnum**

```typescript
// backend/src/modules/motorcycle/domain/enums/motorcycle-type.enum.ts
export enum MotorcycleTypeEnum {
  ENDURO = 'ENDURO',
}
```

- [ ] **Step 2: Write test for Motorcycle entity**

```typescript
// backend/src/modules/motorcycle/domain/entities/motorcycle.entity.spec.ts
import { Motorcycle } from './motorcycle.entity';
import { MotorcycleTypeEnum } from '../enums/motorcycle-type.enum';
import { ValidationException } from '../../../../shared/domain/exceptions';

describe('Motorcycle Entity', () => {
  const validProps = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    name: 'My KTM',
    brand: 'KTM',
    model: 'EXC-F 350',
    year: 2023,
    type: MotorcycleTypeEnum.ENDURO,
    currentHours: 142.5,
  };

  it('should create a valid motorcycle', () => {
    const moto = new Motorcycle(validProps);
    expect(moto.name).toBe('My KTM');
    expect(moto.currentHours).toBe(142.5);
    expect(moto.type).toBe(MotorcycleTypeEnum.ENDURO);
  });

  it('should reject empty name', () => {
    expect(() => new Motorcycle({ ...validProps, name: '' })).toThrow(ValidationException);
  });

  it('should reject name longer than 255', () => {
    expect(() => new Motorcycle({ ...validProps, name: 'a'.repeat(256) })).toThrow(ValidationException);
  });

  it('should reject empty brand', () => {
    expect(() => new Motorcycle({ ...validProps, brand: '' })).toThrow(ValidationException);
  });

  it('should reject empty model', () => {
    expect(() => new Motorcycle({ ...validProps, model: '' })).toThrow(ValidationException);
  });

  it('should reject year in the future', () => {
    expect(() => new Motorcycle({ ...validProps, year: 2099 })).toThrow(ValidationException);
  });

  it('should reject negative currentHours', () => {
    expect(() => new Motorcycle({ ...validProps, currentHours: -1 })).toThrow(ValidationException);
  });

  it('should reject invalid type', () => {
    expect(() => new Motorcycle({ ...validProps, type: 'INVALID' as any })).toThrow(ValidationException);
  });

  it('should update hours (increase only)', () => {
    const moto = new Motorcycle(validProps);
    moto.updateHours(150);
    expect(moto.currentHours).toBe(150);
  });

  it('should reject decreasing hours', () => {
    const moto = new Motorcycle(validProps);
    expect(() => moto.updateHours(100)).toThrow(ValidationException);
  });

  it('should allow same hours (no change)', () => {
    const moto = new Motorcycle(validProps);
    moto.updateHours(142.5);
    expect(moto.currentHours).toBe(142.5);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd /home/user/projects/mts/backend && npx jest src/modules/motorcycle/domain/entities/motorcycle.entity.spec.ts --verbose`
Expected: FAIL — Cannot find module

- [ ] **Step 4: Implement Motorcycle entity**

```typescript
// backend/src/modules/motorcycle/domain/entities/motorcycle.entity.ts
import { BaseEntity } from '../../../../shared/domain/base.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';
import { MotorcycleTypeEnum } from '../enums/motorcycle-type.enum';

interface MotorcycleProps {
  id?: string;
  userId: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: MotorcycleTypeEnum;
  currentHours: number;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Motorcycle extends BaseEntity {
  readonly userId: string;
  private _name: string;
  private _brand: string;
  private _model: string;
  private _year: number;
  private _type: MotorcycleTypeEnum;
  private _currentHours: number;
  private _imageUrl: string | null;

  constructor(props: MotorcycleProps) {
    super(props.id);
    this.userId = props.userId;
    this.validateString(props.name, 'Name', 255);
    this.validateString(props.brand, 'Brand', 255);
    this.validateString(props.model, 'Model', 255);
    this.validateYear(props.year);
    this.validateType(props.type);
    this.validateHours(props.currentHours);
    this._name = props.name;
    this._brand = props.brand;
    this._model = props.model;
    this._year = props.year;
    this._type = props.type;
    this._currentHours = props.currentHours;
    this._imageUrl = props.imageUrl ?? null;
    if (props.createdAt) (this as any).createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
  }

  get name(): string { return this._name; }
  get brand(): string { return this._brand; }
  get model(): string { return this._model; }
  get year(): number { return this._year; }
  get type(): MotorcycleTypeEnum { return this._type; }
  get currentHours(): number { return this._currentHours; }
  get imageUrl(): string | null { return this._imageUrl; }

  updateHours(hours: number): void {
    if (hours < this._currentHours) {
      throw new ValidationException('Hours can only increase');
    }
    this._currentHours = hours;
    this.updatedAt = new Date();
  }

  updateDetails(props: { name?: string; brand?: string; model?: string; year?: number; type?: MotorcycleTypeEnum; imageUrl?: string }): void {
    if (props.name !== undefined) { this.validateString(props.name, 'Name', 255); this._name = props.name; }
    if (props.brand !== undefined) { this.validateString(props.brand, 'Brand', 255); this._brand = props.brand; }
    if (props.model !== undefined) { this.validateString(props.model, 'Model', 255); this._model = props.model; }
    if (props.year !== undefined) { this.validateYear(props.year); this._year = props.year; }
    if (props.type !== undefined) { this.validateType(props.type); this._type = props.type; }
    if (props.imageUrl !== undefined) { this._imageUrl = props.imageUrl; }
    this.updatedAt = new Date();
  }

  private validateString(value: string, field: string, maxLength: number): void {
    if (!value || value.trim().length === 0) {
      throw new ValidationException(`${field} must not be empty`);
    }
    if (value.length > maxLength) {
      throw new ValidationException(`${field} must not exceed ${maxLength} characters`);
    }
  }

  private validateYear(year: number): void {
    if (year > new Date().getFullYear()) {
      throw new ValidationException('Year cannot be in the future');
    }
  }

  private validateType(type: MotorcycleTypeEnum): void {
    if (!Object.values(MotorcycleTypeEnum).includes(type)) {
      throw new ValidationException('Invalid motorcycle type');
    }
  }

  private validateHours(hours: number): void {
    if (hours < 0) {
      throw new ValidationException('Current hours must be >= 0');
    }
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /home/user/projects/mts/backend && npx jest src/modules/motorcycle/domain/entities/motorcycle.entity.spec.ts --verbose`
Expected: PASS — 11 tests

- [ ] **Step 6: Create MotorcycleRepository port**

```typescript
// backend/src/modules/motorcycle/domain/ports/motorcycle-repository.port.ts
import { Motorcycle } from '../entities/motorcycle.entity';

export const MOTORCYCLE_REPOSITORY = Symbol('MOTORCYCLE_REPOSITORY');

export interface MotorcycleRepositoryPort {
  findById(id: string): Promise<Motorcycle | null>;
  findByUserId(userId: string): Promise<Motorcycle[]>;
  save(motorcycle: Motorcycle): Promise<Motorcycle>;
  delete(id: string): Promise<void>;
}
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/modules/motorcycle/domain/
git commit -m "feat(backend): add Motorcycle domain — entity, enum, repository port"
```

---

## Task 6: Motorcycle Module — Infrastructure & Application

**Files:**
- Create: `backend/src/modules/motorcycle/infrastructure/persistence/motorcycle.orm-entity.ts`
- Create: `backend/src/modules/motorcycle/infrastructure/persistence/motorcycle.mapper.ts`
- Create: `backend/src/modules/motorcycle/infrastructure/persistence/motorcycle.repository.ts`
- Create: `backend/src/modules/motorcycle/application/use-cases/create-motorcycle.use-case.ts`
- Create: `backend/src/modules/motorcycle/application/use-cases/update-motorcycle.use-case.ts`
- Create: `backend/src/modules/motorcycle/application/use-cases/update-hours.use-case.ts`
- Create: `backend/src/modules/motorcycle/application/use-cases/get-motorcycles.use-case.ts`
- Create: `backend/src/modules/motorcycle/application/use-cases/get-motorcycle-detail.use-case.ts`
- Create: `backend/src/modules/motorcycle/application/use-cases/delete-motorcycle.use-case.ts`
- Create: `backend/src/modules/motorcycle/infrastructure/controllers/motorcycle.controller.ts`
- Create: `backend/src/modules/motorcycle/motorcycle.module.ts`

- [ ] **Step 1: Create ORM entity**

```typescript
// backend/src/modules/motorcycle/infrastructure/persistence/motorcycle.orm-entity.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('motorcycles')
export class MotorcycleOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  brand: string;

  @Column({ length: 255 })
  model: string;

  @Column()
  year: number;

  @Column({ length: 50 })
  type: string;

  @Column({ name: 'current_hours', type: 'decimal', precision: 10, scale: 1 })
  currentHours: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

- [ ] **Step 2: Create mapper**

```typescript
// backend/src/modules/motorcycle/infrastructure/persistence/motorcycle.mapper.ts
import { Motorcycle } from '../../domain/entities/motorcycle.entity';
import { MotorcycleTypeEnum } from '../../domain/enums/motorcycle-type.enum';
import { MotorcycleOrmEntity } from './motorcycle.orm-entity';

export class MotorcycleMapper {
  static toDomain(orm: MotorcycleOrmEntity): Motorcycle {
    return new Motorcycle({
      id: orm.id,
      userId: orm.userId,
      name: orm.name,
      brand: orm.brand,
      model: orm.model,
      year: orm.year,
      type: orm.type as MotorcycleTypeEnum,
      currentHours: Number(orm.currentHours),
      imageUrl: orm.imageUrl ?? undefined,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: Motorcycle): MotorcycleOrmEntity {
    const orm = new MotorcycleOrmEntity();
    orm.id = domain.id;
    orm.userId = domain.userId;
    orm.name = domain.name;
    orm.brand = domain.brand;
    orm.model = domain.model;
    orm.year = domain.year;
    orm.type = domain.type;
    orm.currentHours = domain.currentHours;
    orm.imageUrl = domain.imageUrl;
    return orm;
  }
}
```

- [ ] **Step 3: Create repository**

```typescript
// backend/src/modules/motorcycle/infrastructure/persistence/motorcycle.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MotorcycleRepositoryPort } from '../../domain/ports/motorcycle-repository.port';
import { Motorcycle } from '../../domain/entities/motorcycle.entity';
import { MotorcycleOrmEntity } from './motorcycle.orm-entity';
import { MotorcycleMapper } from './motorcycle.mapper';

@Injectable()
export class MotorcycleRepository implements MotorcycleRepositoryPort {
  constructor(
    @InjectRepository(MotorcycleOrmEntity)
    private readonly repo: Repository<MotorcycleOrmEntity>,
  ) {}

  async findById(id: string): Promise<Motorcycle | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? MotorcycleMapper.toDomain(orm) : null;
  }

  async findByUserId(userId: string): Promise<Motorcycle[]> {
    const orms = await this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    return orms.map(MotorcycleMapper.toDomain);
  }

  async save(motorcycle: Motorcycle): Promise<Motorcycle> {
    const orm = MotorcycleMapper.toOrm(motorcycle);
    const saved = await this.repo.save(orm);
    return MotorcycleMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
```

- [ ] **Step 4: Create use cases**

```typescript
// backend/src/modules/motorcycle/application/use-cases/create-motorcycle.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../domain/ports/motorcycle-repository.port';
import { Motorcycle } from '../../domain/entities/motorcycle.entity';
import { MotorcycleTypeEnum } from '../../domain/enums/motorcycle-type.enum';
import { DefaultTaskFactory } from '../../../maintenance/domain/services/default-task-factory.service';

@Injectable()
export class CreateMotorcycleUseCase {
  constructor(
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
    private readonly defaultTaskFactory: DefaultTaskFactory,
  ) {}

  async execute(params: {
    userId: string;
    name: string;
    brand: string;
    model: string;
    year: number;
    type: MotorcycleTypeEnum;
    currentHours: number;
    imageUrl?: string;
  }): Promise<Motorcycle> {
    const motorcycle = new Motorcycle(params);
    const saved = await this.motoRepo.save(motorcycle);
    await this.defaultTaskFactory.createDefaultTasks(saved.id, saved.type);
    return saved;
  }
}
```

```typescript
// backend/src/modules/motorcycle/application/use-cases/update-motorcycle.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../domain/ports/motorcycle-repository.port';
import { NotFoundException, ForbiddenException } from '../../../../shared/domain/exceptions';
import { Motorcycle } from '../../domain/entities/motorcycle.entity';
import { MotorcycleTypeEnum } from '../../domain/enums/motorcycle-type.enum';

@Injectable()
export class UpdateMotorcycleUseCase {
  constructor(
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string, motorcycleId: string, params: {
    name?: string;
    brand?: string;
    model?: string;
    year?: number;
    type?: MotorcycleTypeEnum;
    imageUrl?: string;
  }): Promise<Motorcycle> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.userId !== userId) throw new ForbiddenException('Not your motorcycle');
    moto.updateDetails(params);
    return this.motoRepo.save(moto);
  }
}
```

```typescript
// backend/src/modules/motorcycle/application/use-cases/update-hours.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../domain/ports/motorcycle-repository.port';
import { NotFoundException, ForbiddenException } from '../../../../shared/domain/exceptions';
import { Motorcycle } from '../../domain/entities/motorcycle.entity';

@Injectable()
export class UpdateHoursUseCase {
  constructor(
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string, motorcycleId: string, hours: number): Promise<Motorcycle> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.userId !== userId) throw new ForbiddenException('Not your motorcycle');
    moto.updateHours(hours);
    return this.motoRepo.save(moto);
  }
}
```

```typescript
// backend/src/modules/motorcycle/application/use-cases/get-motorcycles.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../domain/ports/motorcycle-repository.port';
import { Motorcycle } from '../../domain/entities/motorcycle.entity';

@Injectable()
export class GetMotorcyclesUseCase {
  constructor(
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string): Promise<Motorcycle[]> {
    return this.motoRepo.findByUserId(userId);
  }
}
```

```typescript
// backend/src/modules/motorcycle/application/use-cases/get-motorcycle-detail.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../domain/ports/motorcycle-repository.port';
import { NotFoundException, ForbiddenException } from '../../../../shared/domain/exceptions';
import { Motorcycle } from '../../domain/entities/motorcycle.entity';

@Injectable()
export class GetMotorcycleDetailUseCase {
  constructor(
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string, motorcycleId: string): Promise<Motorcycle> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.userId !== userId) throw new ForbiddenException('Not your motorcycle');
    return moto;
  }
}
```

```typescript
// backend/src/modules/motorcycle/application/use-cases/delete-motorcycle.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../domain/ports/motorcycle-repository.port';
import { NotFoundException, ForbiddenException } from '../../../../shared/domain/exceptions';

@Injectable()
export class DeleteMotorcycleUseCase {
  constructor(
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string, motorcycleId: string): Promise<void> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.userId !== userId) throw new ForbiddenException('Not your motorcycle');
    await this.motoRepo.delete(motorcycleId);
  }
}
```

- [ ] **Step 5: Create MotorcycleController**

```typescript
// backend/src/modules/motorcycle/infrastructure/controllers/motorcycle.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateMotorcycleUseCase } from '../../application/use-cases/create-motorcycle.use-case';
import { UpdateMotorcycleUseCase } from '../../application/use-cases/update-motorcycle.use-case';
import { UpdateHoursUseCase } from '../../application/use-cases/update-hours.use-case';
import { GetMotorcyclesUseCase } from '../../application/use-cases/get-motorcycles.use-case';
import { GetMotorcycleDetailUseCase } from '../../application/use-cases/get-motorcycle-detail.use-case';
import { DeleteMotorcycleUseCase } from '../../application/use-cases/delete-motorcycle.use-case';
import { MotorcycleTypeEnum } from '../../domain/enums/motorcycle-type.enum';
import { IsString, IsNotEmpty, MaxLength, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class CreateMotorcycleDto {
  @IsString() @IsNotEmpty() @MaxLength(255) name: string;
  @IsString() @IsNotEmpty() @MaxLength(255) brand: string;
  @IsString() @IsNotEmpty() @MaxLength(255) model: string;
  @IsNumber() year: number;
  @IsEnum(MotorcycleTypeEnum) type: MotorcycleTypeEnum;
  @IsNumber() @Min(0) currentHours: number;
  @IsOptional() @IsString() imageUrl?: string;
}

export class UpdateMotorcycleDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) name?: string;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) brand?: string;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) model?: string;
  @IsOptional() @IsNumber() year?: number;
  @IsOptional() @IsEnum(MotorcycleTypeEnum) type?: MotorcycleTypeEnum;
  @IsOptional() @IsString() imageUrl?: string;
}

export class UpdateHoursDto {
  @IsNumber() @Min(0) currentHours: number;
}

@Controller('motorcycles')
@UseGuards(JwtAuthGuard)
export class MotorcycleController {
  constructor(
    private readonly createMotorcycle: CreateMotorcycleUseCase,
    private readonly updateMotorcycle: UpdateMotorcycleUseCase,
    private readonly updateHours: UpdateHoursUseCase,
    private readonly getMotorcycles: GetMotorcyclesUseCase,
    private readonly getMotorcycleDetail: GetMotorcycleDetailUseCase,
    private readonly deleteMotorcycle: DeleteMotorcycleUseCase,
  ) {}

  @Get()
  async list(@Req() req: any) {
    const motos = await this.getMotorcycles.execute(req.user.id);
    return motos.map((m) => ({
      id: m.id, name: m.name, brand: m.brand, model: m.model,
      year: m.year, type: m.type, currentHours: m.currentHours, imageUrl: m.imageUrl,
    }));
  }

  @Get(':id')
  async detail(@Req() req: any, @Param('id') id: string) {
    const m = await this.getMotorcycleDetail.execute(req.user.id, id);
    return {
      id: m.id, name: m.name, brand: m.brand, model: m.model,
      year: m.year, type: m.type, currentHours: m.currentHours, imageUrl: m.imageUrl,
    };
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateMotorcycleDto) {
    const m = await this.createMotorcycle.execute({ userId: req.user.id, ...dto });
    return { id: m.id, name: m.name, brand: m.brand, model: m.model, year: m.year, type: m.type, currentHours: m.currentHours };
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateMotorcycleDto) {
    const m = await this.updateMotorcycle.execute(req.user.id, id, dto);
    return { id: m.id, name: m.name, brand: m.brand, model: m.model, year: m.year, type: m.type, currentHours: m.currentHours };
  }

  @Patch(':id/hours')
  async logHours(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateHoursDto) {
    const m = await this.updateHours.execute(req.user.id, id, dto.currentHours);
    return { id: m.id, currentHours: m.currentHours };
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.deleteMotorcycle.execute(req.user.id, id);
    return { deleted: true };
  }
}
```

- [ ] **Step 6: Create motorcycle.module.ts** (note: depends on MaintenanceModule — will wire in Task 8)

```typescript
// backend/src/modules/motorcycle/motorcycle.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotorcycleOrmEntity } from './infrastructure/persistence/motorcycle.orm-entity';
import { MotorcycleRepository } from './infrastructure/persistence/motorcycle.repository';
import { MOTORCYCLE_REPOSITORY } from './domain/ports/motorcycle-repository.port';
import { CreateMotorcycleUseCase } from './application/use-cases/create-motorcycle.use-case';
import { UpdateMotorcycleUseCase } from './application/use-cases/update-motorcycle.use-case';
import { UpdateHoursUseCase } from './application/use-cases/update-hours.use-case';
import { GetMotorcyclesUseCase } from './application/use-cases/get-motorcycles.use-case';
import { GetMotorcycleDetailUseCase } from './application/use-cases/get-motorcycle-detail.use-case';
import { DeleteMotorcycleUseCase } from './application/use-cases/delete-motorcycle.use-case';
import { MotorcycleController } from './infrastructure/controllers/motorcycle.controller';
import { MaintenanceModule } from '../maintenance/maintenance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MotorcycleOrmEntity]),
    forwardRef(() => MaintenanceModule),
  ],
  controllers: [MotorcycleController],
  providers: [
    { provide: MOTORCYCLE_REPOSITORY, useClass: MotorcycleRepository },
    CreateMotorcycleUseCase,
    UpdateMotorcycleUseCase,
    UpdateHoursUseCase,
    GetMotorcyclesUseCase,
    GetMotorcycleDetailUseCase,
    DeleteMotorcycleUseCase,
  ],
  exports: [MOTORCYCLE_REPOSITORY],
})
export class MotorcycleModule {}
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/modules/motorcycle/
git commit -m "feat(backend): add Motorcycle module — ORM, repository, use cases, controller"
```

---

## Task 7: Maintenance Module — Domain Layer

**Files:**
- Create: `backend/src/modules/maintenance/domain/entities/maintenance-task.entity.ts`
- Create: `backend/src/modules/maintenance/domain/entities/maintenance-record.entity.ts`
- Create: `backend/src/modules/maintenance/domain/value-objects/task-status.vo.ts`
- Create: `backend/src/modules/maintenance/domain/services/maintenance-calculator.service.ts`
- Create: `backend/src/modules/maintenance/domain/services/default-task-factory.service.ts`
- Create: `backend/src/modules/maintenance/domain/constants/default-tasks.constants.ts`
- Create: `backend/src/modules/maintenance/domain/ports/maintenance-task-repository.port.ts`
- Create: `backend/src/modules/maintenance/domain/ports/maintenance-record-repository.port.ts`
- Test: `backend/src/modules/maintenance/domain/entities/maintenance-task.entity.spec.ts`
- Test: `backend/src/modules/maintenance/domain/entities/maintenance-record.entity.spec.ts`
- Test: `backend/src/modules/maintenance/domain/value-objects/task-status.vo.spec.ts`
- Test: `backend/src/modules/maintenance/domain/services/maintenance-calculator.service.spec.ts`

- [ ] **Step 1: Create TaskStatus value object and test**

```typescript
// backend/src/modules/maintenance/domain/value-objects/task-status.vo.spec.ts
import { TaskStatus, TaskStatusEnum } from './task-status.vo';

describe('TaskStatus', () => {
  it('should be OVERDUE when hoursRemaining <= 0', () => {
    const status = TaskStatus.calculate(15, 15, 142.5, 130);
    // remaining = 15 - (142.5 - 130) = 15 - 12.5 = 2.5 → OK
    expect(status.status).toBe(TaskStatusEnum.OK);
    expect(status.hoursRemaining).toBe(2.5);
  });

  it('should be OVERDUE when remaining is negative', () => {
    const status = TaskStatus.calculate(15, 15, 150, 130);
    // remaining = 15 - (150 - 130) = 15 - 20 = -5 → OVERDUE
    expect(status.status).toBe(TaskStatusEnum.OVERDUE);
    expect(status.hoursRemaining).toBe(-5);
  });

  it('should be DUE_SOON when remaining <= 2', () => {
    const status = TaskStatus.calculate(15, 15, 143.5, 130);
    // remaining = 15 - (143.5 - 130) = 15 - 13.5 = 1.5 → DUE_SOON
    expect(status.status).toBe(TaskStatusEnum.DUE_SOON);
    expect(status.hoursRemaining).toBe(1.5);
  });

  it('should be OVERDUE when lastServicedAtHours is null (new task)', () => {
    const status = TaskStatus.calculate(15, null, 100, null);
    expect(status.status).toBe(TaskStatusEnum.OVERDUE);
    expect(status.hoursRemaining).toBe(0);
  });
});
```

```typescript
// backend/src/modules/maintenance/domain/value-objects/task-status.vo.ts
export enum TaskStatusEnum {
  OK = 'OK',
  DUE_SOON = 'DUE_SOON',
  OVERDUE = 'OVERDUE',
}

const DUE_SOON_THRESHOLD = 2;

export class TaskStatus {
  constructor(
    public readonly status: TaskStatusEnum,
    public readonly hoursRemaining: number,
  ) {}

  static calculate(
    intervalHours: number,
    _intervalHoursUnused: number | null,
    currentHours: number,
    lastServicedAtHours: number | null,
  ): TaskStatus {
    if (lastServicedAtHours === null) {
      return new TaskStatus(TaskStatusEnum.OVERDUE, 0);
    }
    const remaining = intervalHours - (currentHours - lastServicedAtHours);
    if (remaining <= 0) {
      return new TaskStatus(TaskStatusEnum.OVERDUE, remaining);
    }
    if (remaining <= DUE_SOON_THRESHOLD) {
      return new TaskStatus(TaskStatusEnum.DUE_SOON, remaining);
    }
    return new TaskStatus(TaskStatusEnum.OK, remaining);
  }
}
```

Wait — the calculate signature is wrong. Let me fix it:

```typescript
// backend/src/modules/maintenance/domain/value-objects/task-status.vo.ts
export enum TaskStatusEnum {
  OK = 'OK',
  DUE_SOON = 'DUE_SOON',
  OVERDUE = 'OVERDUE',
}

const DUE_SOON_THRESHOLD = 2;

export class TaskStatus {
  constructor(
    public readonly status: TaskStatusEnum,
    public readonly hoursRemaining: number,
  ) {}

  static calculate(
    intervalHours: number,
    currentHours: number,
    lastServicedAtHours: number | null,
  ): TaskStatus {
    if (lastServicedAtHours === null) {
      return new TaskStatus(TaskStatusEnum.OVERDUE, 0);
    }
    const remaining = intervalHours - (currentHours - lastServicedAtHours);
    if (remaining <= 0) {
      return new TaskStatus(TaskStatusEnum.OVERDUE, remaining);
    }
    if (remaining <= DUE_SOON_THRESHOLD) {
      return new TaskStatus(TaskStatusEnum.DUE_SOON, remaining);
    }
    return new TaskStatus(TaskStatusEnum.OK, remaining);
  }
}
```

And the corrected test:

```typescript
// backend/src/modules/maintenance/domain/value-objects/task-status.vo.spec.ts
import { TaskStatus, TaskStatusEnum } from './task-status.vo';

describe('TaskStatus', () => {
  it('should be OK when hours remaining > 2', () => {
    // remaining = 15 - (142.5 - 130) = 2.5
    const status = TaskStatus.calculate(15, 142.5, 130);
    expect(status.status).toBe(TaskStatusEnum.OK);
    expect(status.hoursRemaining).toBe(2.5);
  });

  it('should be OVERDUE when remaining is negative', () => {
    // remaining = 15 - (150 - 130) = -5
    const status = TaskStatus.calculate(15, 150, 130);
    expect(status.status).toBe(TaskStatusEnum.OVERDUE);
    expect(status.hoursRemaining).toBe(-5);
  });

  it('should be DUE_SOON when remaining <= 2', () => {
    // remaining = 15 - (143.5 - 130) = 1.5
    const status = TaskStatus.calculate(15, 143.5, 130);
    expect(status.status).toBe(TaskStatusEnum.DUE_SOON);
    expect(status.hoursRemaining).toBe(1.5);
  });

  it('should be OVERDUE when lastServicedAtHours is null', () => {
    const status = TaskStatus.calculate(15, 100, null);
    expect(status.status).toBe(TaskStatusEnum.OVERDUE);
    expect(status.hoursRemaining).toBe(0);
  });

  it('should be exactly OVERDUE when remaining is 0', () => {
    // remaining = 15 - (145 - 130) = 0
    const status = TaskStatus.calculate(15, 145, 130);
    expect(status.status).toBe(TaskStatusEnum.OVERDUE);
    expect(status.hoursRemaining).toBe(0);
  });
});
```

- [ ] **Step 2: Run TaskStatus test**

Run: `cd /home/user/projects/mts/backend && npx jest src/modules/maintenance/domain/value-objects/task-status.vo.spec.ts --verbose`
Expected: PASS — 5 tests

- [ ] **Step 3: Create default tasks constants**

```typescript
// backend/src/modules/maintenance/domain/constants/default-tasks.constants.ts
import { MotorcycleTypeEnum } from '../../../motorcycle/domain/enums/motorcycle-type.enum';

interface DefaultTaskTemplate {
  name: string;
  description: string;
  intervalHours: number;
}

export const DEFAULT_TASKS: Record<MotorcycleTypeEnum, DefaultTaskTemplate[]> = {
  [MotorcycleTypeEnum.ENDURO]: [
    { name: 'Engine Oil Change', description: 'Replace engine oil', intervalHours: 15 },
    { name: 'Oil Filter Replacement', description: 'Replace oil filter', intervalHours: 15 },
    { name: 'Air Filter Cleaning', description: 'Clean or replace air filter', intervalHours: 10 },
    { name: 'Chain Lubrication', description: 'Lubricate drive chain', intervalHours: 5 },
    { name: 'Chain Tension Adjustment', description: 'Check and adjust chain tension', intervalHours: 10 },
    { name: 'Coolant Check', description: 'Check and replace coolant', intervalHours: 30 },
    { name: 'Brake Pads Check', description: 'Check and replace brake pads', intervalHours: 25 },
    { name: 'Brake Fluid Replacement', description: 'Replace brake fluid', intervalHours: 50 },
    { name: 'Fork Seal Inspection', description: 'Inspect fork seals for leaks', intervalHours: 40 },
    { name: 'Shock Absorber Service', description: 'Service rear shock absorber', intervalHours: 50 },
    { name: 'Spark Plug Replacement', description: 'Replace spark plug', intervalHours: 30 },
    { name: 'Valve Clearance Check', description: 'Check and adjust valve clearance', intervalHours: 30 },
  ],
};
```

- [ ] **Step 4: Create MaintenanceTask entity with test**

```typescript
// backend/src/modules/maintenance/domain/entities/maintenance-task.entity.spec.ts
import { MaintenanceTask } from './maintenance-task.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

describe('MaintenanceTask Entity', () => {
  const validProps = {
    motorcycleId: '123',
    name: 'Oil Change',
    intervalHours: 15,
    isDefault: true,
    isActive: true,
  };

  it('should create a valid task', () => {
    const task = new MaintenanceTask(validProps);
    expect(task.name).toBe('Oil Change');
    expect(task.intervalHours).toBe(15);
    expect(task.lastServicedAtHours).toBeNull();
  });

  it('should reject empty name', () => {
    expect(() => new MaintenanceTask({ ...validProps, name: '' })).toThrow(ValidationException);
  });

  it('should reject intervalHours <= 0', () => {
    expect(() => new MaintenanceTask({ ...validProps, intervalHours: 0 })).toThrow(ValidationException);
    expect(() => new MaintenanceTask({ ...validProps, intervalHours: -5 })).toThrow(ValidationException);
  });

  it('should allow null lastServicedAtHours', () => {
    const task = new MaintenanceTask(validProps);
    expect(task.lastServicedAtHours).toBeNull();
  });

  it('should update lastServicedAtHours', () => {
    const task = new MaintenanceTask(validProps);
    task.markServiced(100);
    expect(task.lastServicedAtHours).toBe(100);
  });
});
```

```typescript
// backend/src/modules/maintenance/domain/entities/maintenance-task.entity.ts
import { BaseEntity } from '../../../../shared/domain/base.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

interface MaintenanceTaskProps {
  id?: string;
  motorcycleId: string;
  name: string;
  description?: string;
  intervalHours: number;
  lastServicedAtHours?: number | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MaintenanceTask extends BaseEntity {
  readonly motorcycleId: string;
  private _name: string;
  private _description: string | null;
  private _intervalHours: number;
  private _lastServicedAtHours: number | null;
  private _isDefault: boolean;
  private _isActive: boolean;

  constructor(props: MaintenanceTaskProps) {
    super(props.id);
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationException('Task name must not be empty');
    }
    if (props.intervalHours <= 0) {
      throw new ValidationException('Interval hours must be greater than 0');
    }
    this.motorcycleId = props.motorcycleId;
    this._name = props.name;
    this._description = props.description ?? null;
    this._intervalHours = props.intervalHours;
    this._lastServicedAtHours = props.lastServicedAtHours ?? null;
    this._isDefault = props.isDefault;
    this._isActive = props.isActive;
    if (props.createdAt) (this as any).createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
  }

  get name(): string { return this._name; }
  get description(): string | null { return this._description; }
  get intervalHours(): number { return this._intervalHours; }
  get lastServicedAtHours(): number | null { return this._lastServicedAtHours; }
  get isDefault(): boolean { return this._isDefault; }
  get isActive(): boolean { return this._isActive; }

  markServiced(atHours: number): void {
    this._lastServicedAtHours = atHours;
    this.updatedAt = new Date();
  }

  rollbackLastServiced(previousHours: number | null): void {
    this._lastServicedAtHours = previousHours;
    this.updatedAt = new Date();
  }

  updateDetails(props: { name?: string; description?: string; intervalHours?: number; isActive?: boolean }): void {
    if (props.name !== undefined) {
      if (!props.name || props.name.trim().length === 0) throw new ValidationException('Task name must not be empty');
      this._name = props.name;
    }
    if (props.description !== undefined) this._description = props.description;
    if (props.intervalHours !== undefined) {
      if (props.intervalHours <= 0) throw new ValidationException('Interval hours must be greater than 0');
      this._intervalHours = props.intervalHours;
    }
    if (props.isActive !== undefined) this._isActive = props.isActive;
    this.updatedAt = new Date();
  }
}
```

- [ ] **Step 5: Run MaintenanceTask test**

Run: `cd /home/user/projects/mts/backend && npx jest src/modules/maintenance/domain/entities/maintenance-task.entity.spec.ts --verbose`
Expected: PASS — 5 tests

- [ ] **Step 6: Create MaintenanceRecord entity with test**

```typescript
// backend/src/modules/maintenance/domain/entities/maintenance-record.entity.spec.ts
import { MaintenanceRecord } from './maintenance-record.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

describe('MaintenanceRecord Entity', () => {
  const validProps = {
    taskId: '123',
    motorcycleId: '456',
    performedAtHours: 100,
    performedAtDate: new Date('2026-04-13'),
    currentMotorcycleHours: 142.5,
  };

  it('should create a valid record', () => {
    const record = new MaintenanceRecord(validProps);
    expect(record.performedAtHours).toBe(100);
  });

  it('should reject performedAtHours > currentMotorcycleHours', () => {
    expect(
      () => new MaintenanceRecord({ ...validProps, performedAtHours: 200 }),
    ).toThrow(ValidationException);
  });

  it('should reject future performedAtDate', () => {
    expect(
      () => new MaintenanceRecord({ ...validProps, performedAtDate: new Date('2099-01-01') }),
    ).toThrow(ValidationException);
  });

  it('should allow performedAtHours equal to currentMotorcycleHours', () => {
    const record = new MaintenanceRecord({ ...validProps, performedAtHours: 142.5 });
    expect(record.performedAtHours).toBe(142.5);
  });
});
```

```typescript
// backend/src/modules/maintenance/domain/entities/maintenance-record.entity.ts
import { BaseEntity } from '../../../../shared/domain/base.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

interface MaintenanceRecordProps {
  id?: string;
  taskId: string;
  motorcycleId: string;
  performedAtHours: number;
  performedAtDate: Date;
  currentMotorcycleHours: number;
  notes?: string;
  photos?: string[];
  createdAt?: Date;
}

export class MaintenanceRecord extends BaseEntity {
  readonly taskId: string;
  readonly motorcycleId: string;
  private _performedAtHours: number;
  private _performedAtDate: Date;
  private _notes: string | null;
  private _photos: string[];

  constructor(props: MaintenanceRecordProps) {
    super(props.id);
    if (props.performedAtHours > props.currentMotorcycleHours) {
      throw new ValidationException('Performed at hours cannot exceed current motorcycle hours');
    }
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    if (props.performedAtDate > now) {
      throw new ValidationException('Performed date must not be in the future');
    }
    this.taskId = props.taskId;
    this.motorcycleId = props.motorcycleId;
    this._performedAtHours = props.performedAtHours;
    this._performedAtDate = props.performedAtDate;
    this._notes = props.notes ?? null;
    this._photos = props.photos ?? [];
    if (props.createdAt) (this as any).createdAt = props.createdAt;
  }

  get performedAtHours(): number { return this._performedAtHours; }
  get performedAtDate(): Date { return this._performedAtDate; }
  get notes(): string | null { return this._notes; }
  get photos(): string[] { return this._photos; }

  updateDetails(props: {
    performedAtHours?: number;
    performedAtDate?: Date;
    currentMotorcycleHours: number;
    notes?: string;
    photos?: string[];
  }): void {
    if (props.performedAtHours !== undefined) {
      if (props.performedAtHours > props.currentMotorcycleHours) {
        throw new ValidationException('Performed at hours cannot exceed current motorcycle hours');
      }
      this._performedAtHours = props.performedAtHours;
    }
    if (props.performedAtDate !== undefined) {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      if (props.performedAtDate > now) {
        throw new ValidationException('Performed date must not be in the future');
      }
      this._performedAtDate = props.performedAtDate;
    }
    if (props.notes !== undefined) this._notes = props.notes;
    if (props.photos !== undefined) this._photos = props.photos;
  }
}
```

- [ ] **Step 7: Run MaintenanceRecord test**

Run: `cd /home/user/projects/mts/backend && npx jest src/modules/maintenance/domain/entities/maintenance-record.entity.spec.ts --verbose`
Expected: PASS — 4 tests

- [ ] **Step 8: Create repository ports**

```typescript
// backend/src/modules/maintenance/domain/ports/maintenance-task-repository.port.ts
import { MaintenanceTask } from '../entities/maintenance-task.entity';

export const MAINTENANCE_TASK_REPOSITORY = Symbol('MAINTENANCE_TASK_REPOSITORY');

export interface MaintenanceTaskRepositoryPort {
  findById(id: string): Promise<MaintenanceTask | null>;
  findByMotorcycleId(motorcycleId: string): Promise<MaintenanceTask[]>;
  save(task: MaintenanceTask): Promise<MaintenanceTask>;
  saveMany(tasks: MaintenanceTask[]): Promise<MaintenanceTask[]>;
  delete(id: string): Promise<void>;
  deleteByMotorcycleId(motorcycleId: string): Promise<void>;
}
```

```typescript
// backend/src/modules/maintenance/domain/ports/maintenance-record-repository.port.ts
import { MaintenanceRecord } from '../entities/maintenance-record.entity';

export const MAINTENANCE_RECORD_REPOSITORY = Symbol('MAINTENANCE_RECORD_REPOSITORY');

export interface MaintenanceRecordRepositoryPort {
  findById(id: string): Promise<MaintenanceRecord | null>;
  findByMotorcycleId(motorcycleId: string, taskId?: string, page?: number, limit?: number): Promise<{ records: MaintenanceRecord[]; total: number }>;
  findLatestByTaskId(taskId: string): Promise<MaintenanceRecord | null>;
  findPreviousByTaskId(taskId: string, excludeRecordId: string): Promise<MaintenanceRecord | null>;
  save(record: MaintenanceRecord): Promise<MaintenanceRecord>;
  delete(id: string): Promise<void>;
  deleteByMotorcycleId(motorcycleId: string): Promise<void>;
}
```

- [ ] **Step 9: Create MaintenanceCalculator and DefaultTaskFactory**

```typescript
// backend/src/modules/maintenance/domain/services/maintenance-calculator.service.ts
import { Injectable } from '@nestjs/common';
import { MaintenanceTask } from '../entities/maintenance-task.entity';
import { TaskStatus } from '../value-objects/task-status.vo';

export interface TaskWithStatus {
  task: MaintenanceTask;
  status: TaskStatus;
}

@Injectable()
export class MaintenanceCalculator {
  calculateStatuses(tasks: MaintenanceTask[], currentHours: number): TaskWithStatus[] {
    return tasks
      .filter((t) => t.isActive)
      .map((task) => ({
        task,
        status: TaskStatus.calculate(task.intervalHours, currentHours, task.lastServicedAtHours),
      }));
  }
}
```

```typescript
// backend/src/modules/maintenance/domain/services/default-task-factory.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { MAINTENANCE_TASK_REPOSITORY, MaintenanceTaskRepositoryPort } from '../ports/maintenance-task-repository.port';
import { MaintenanceTask } from '../entities/maintenance-task.entity';
import { DEFAULT_TASKS } from '../constants/default-tasks.constants';
import { MotorcycleTypeEnum } from '../../../motorcycle/domain/enums/motorcycle-type.enum';

@Injectable()
export class DefaultTaskFactory {
  constructor(
    @Inject(MAINTENANCE_TASK_REPOSITORY)
    private readonly taskRepo: MaintenanceTaskRepositoryPort,
  ) {}

  async createDefaultTasks(motorcycleId: string, type: MotorcycleTypeEnum): Promise<MaintenanceTask[]> {
    const templates = DEFAULT_TASKS[type] || [];
    const tasks = templates.map(
      (t) =>
        new MaintenanceTask({
          motorcycleId,
          name: t.name,
          description: t.description,
          intervalHours: t.intervalHours,
          isDefault: true,
          isActive: true,
        }),
    );
    return this.taskRepo.saveMany(tasks);
  }
}
```

- [ ] **Step 10: Commit**

```bash
git add backend/src/modules/maintenance/domain/
git commit -m "feat(backend): add Maintenance domain — entities, value objects, services, constants"
```

---

## Task 8: Maintenance Module — Task Infrastructure & Application

**Files:**
- Create: `backend/src/modules/maintenance/infrastructure/persistence/maintenance-task.orm-entity.ts`
- Create: `backend/src/modules/maintenance/infrastructure/persistence/maintenance-task.mapper.ts`
- Create: `backend/src/modules/maintenance/infrastructure/persistence/maintenance-task.repository.ts`
- Create: `backend/src/modules/maintenance/application/use-cases/complete-task.use-case.ts`
- Create: `backend/src/modules/maintenance/application/use-cases/create-custom-task.use-case.ts`
- Create: `backend/src/modules/maintenance/application/use-cases/update-task.use-case.ts`
- Create: `backend/src/modules/maintenance/application/use-cases/delete-task.use-case.ts`
- Create: `backend/src/modules/maintenance/application/use-cases/get-task-dashboard.use-case.ts`
- Create: `backend/src/modules/maintenance/infrastructure/controllers/maintenance-task.controller.ts`

- [ ] **Step 1: Create task ORM entity, mapper, repository**

```typescript
// backend/src/modules/maintenance/infrastructure/persistence/maintenance-task.orm-entity.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('maintenance_tasks')
export class MaintenanceTaskOrmEntity {
  @PrimaryColumn('uuid') id: string;
  @Column({ name: 'motorcycle_id', type: 'uuid' }) motorcycleId: string;
  @Column() name: string;
  @Column({ nullable: true }) description: string | null;
  @Column({ name: 'interval_hours', type: 'decimal', precision: 10, scale: 1 }) intervalHours: number;
  @Column({ name: 'last_serviced_at_hours', type: 'decimal', precision: 10, scale: 1, nullable: true }) lastServicedAtHours: number | null;
  @Column({ name: 'is_default' }) isDefault: boolean;
  @Column({ name: 'is_active' }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
```

```typescript
// backend/src/modules/maintenance/infrastructure/persistence/maintenance-task.mapper.ts
import { MaintenanceTask } from '../../domain/entities/maintenance-task.entity';
import { MaintenanceTaskOrmEntity } from './maintenance-task.orm-entity';

export class MaintenanceTaskMapper {
  static toDomain(orm: MaintenanceTaskOrmEntity): MaintenanceTask {
    return new MaintenanceTask({
      id: orm.id,
      motorcycleId: orm.motorcycleId,
      name: orm.name,
      description: orm.description ?? undefined,
      intervalHours: Number(orm.intervalHours),
      lastServicedAtHours: orm.lastServicedAtHours !== null ? Number(orm.lastServicedAtHours) : null,
      isDefault: orm.isDefault,
      isActive: orm.isActive,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: MaintenanceTask): MaintenanceTaskOrmEntity {
    const orm = new MaintenanceTaskOrmEntity();
    orm.id = domain.id;
    orm.motorcycleId = domain.motorcycleId;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.intervalHours = domain.intervalHours;
    orm.lastServicedAtHours = domain.lastServicedAtHours;
    orm.isDefault = domain.isDefault;
    orm.isActive = domain.isActive;
    return orm;
  }
}
```

```typescript
// backend/src/modules/maintenance/infrastructure/persistence/maintenance-task.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceTaskRepositoryPort } from '../../domain/ports/maintenance-task-repository.port';
import { MaintenanceTask } from '../../domain/entities/maintenance-task.entity';
import { MaintenanceTaskOrmEntity } from './maintenance-task.orm-entity';
import { MaintenanceTaskMapper } from './maintenance-task.mapper';

@Injectable()
export class MaintenanceTaskRepository implements MaintenanceTaskRepositoryPort {
  constructor(
    @InjectRepository(MaintenanceTaskOrmEntity)
    private readonly repo: Repository<MaintenanceTaskOrmEntity>,
  ) {}

  async findById(id: string): Promise<MaintenanceTask | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? MaintenanceTaskMapper.toDomain(orm) : null;
  }

  async findByMotorcycleId(motorcycleId: string): Promise<MaintenanceTask[]> {
    const orms = await this.repo.find({ where: { motorcycleId }, order: { createdAt: 'ASC' } });
    return orms.map(MaintenanceTaskMapper.toDomain);
  }

  async save(task: MaintenanceTask): Promise<MaintenanceTask> {
    const orm = MaintenanceTaskMapper.toOrm(task);
    const saved = await this.repo.save(orm);
    return MaintenanceTaskMapper.toDomain(saved);
  }

  async saveMany(tasks: MaintenanceTask[]): Promise<MaintenanceTask[]> {
    const orms = tasks.map(MaintenanceTaskMapper.toOrm);
    const saved = await this.repo.save(orms);
    return saved.map(MaintenanceTaskMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async deleteByMotorcycleId(motorcycleId: string): Promise<void> {
    await this.repo.delete({ motorcycleId });
  }
}
```

- [ ] **Step 2: Create use cases**

```typescript
// backend/src/modules/maintenance/application/use-cases/get-task-dashboard.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MAINTENANCE_TASK_REPOSITORY, MaintenanceTaskRepositoryPort } from '../../domain/ports/maintenance-task-repository.port';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../../motorcycle/domain/ports/motorcycle-repository.port';
import { MaintenanceCalculator, TaskWithStatus } from '../../domain/services/maintenance-calculator.service';
import { NotFoundException, ForbiddenException } from '../../../../shared/domain/exceptions';

@Injectable()
export class GetTaskDashboardUseCase {
  constructor(
    @Inject(MAINTENANCE_TASK_REPOSITORY) private readonly taskRepo: MaintenanceTaskRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY) private readonly motoRepo: MotorcycleRepositoryPort,
    private readonly calculator: MaintenanceCalculator,
  ) {}

  async execute(userId: string, motorcycleId: string): Promise<TaskWithStatus[]> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.userId !== userId) throw new ForbiddenException('Not your motorcycle');
    const tasks = await this.taskRepo.findByMotorcycleId(motorcycleId);
    return this.calculator.calculateStatuses(tasks, moto.currentHours);
  }
}
```

```typescript
// backend/src/modules/maintenance/application/use-cases/complete-task.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MAINTENANCE_TASK_REPOSITORY, MaintenanceTaskRepositoryPort } from '../../domain/ports/maintenance-task-repository.port';
import { MAINTENANCE_RECORD_REPOSITORY, MaintenanceRecordRepositoryPort } from '../../domain/ports/maintenance-record-repository.port';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../../motorcycle/domain/ports/motorcycle-repository.port';
import { MaintenanceRecord } from '../../domain/entities/maintenance-record.entity';
import { NotFoundException, ForbiddenException } from '../../../../shared/domain/exceptions';

@Injectable()
export class CompleteTaskUseCase {
  constructor(
    @Inject(MAINTENANCE_TASK_REPOSITORY) private readonly taskRepo: MaintenanceTaskRepositoryPort,
    @Inject(MAINTENANCE_RECORD_REPOSITORY) private readonly recordRepo: MaintenanceRecordRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY) private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string, motorcycleId: string, taskId: string, params: {
    performedAtHours: number;
    performedAtDate: Date;
    notes?: string;
    photos?: string[];
  }): Promise<MaintenanceRecord> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.userId !== userId) throw new ForbiddenException('Not your motorcycle');

    const task = await this.taskRepo.findById(taskId);
    if (!task || task.motorcycleId !== motorcycleId) throw new NotFoundException('Task not found');

    const record = new MaintenanceRecord({
      taskId,
      motorcycleId,
      performedAtHours: params.performedAtHours,
      performedAtDate: params.performedAtDate,
      currentMotorcycleHours: moto.currentHours,
      notes: params.notes,
      photos: params.photos,
    });
    const savedRecord = await this.recordRepo.save(record);

    task.markServiced(moto.currentHours);
    await this.taskRepo.save(task);

    return savedRecord;
  }
}
```

```typescript
// backend/src/modules/maintenance/application/use-cases/create-custom-task.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MAINTENANCE_TASK_REPOSITORY, MaintenanceTaskRepositoryPort } from '../../domain/ports/maintenance-task-repository.port';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../../motorcycle/domain/ports/motorcycle-repository.port';
import { MaintenanceTask } from '../../domain/entities/maintenance-task.entity';
import { NotFoundException, ForbiddenException } from '../../../../shared/domain/exceptions';

@Injectable()
export class CreateCustomTaskUseCase {
  constructor(
    @Inject(MAINTENANCE_TASK_REPOSITORY) private readonly taskRepo: MaintenanceTaskRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY) private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string, motorcycleId: string, params: {
    name: string;
    description?: string;
    intervalHours: number;
  }): Promise<MaintenanceTask> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.userId !== userId) throw new ForbiddenException('Not your motorcycle');

    const task = new MaintenanceTask({
      motorcycleId,
      name: params.name,
      description: params.description,
      intervalHours: params.intervalHours,
      isDefault: false,
      isActive: true,
    });
    return this.taskRepo.save(task);
  }
}
```

```typescript
// backend/src/modules/maintenance/application/use-cases/update-task.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MAINTENANCE_TASK_REPOSITORY, MaintenanceTaskRepositoryPort } from '../../domain/ports/maintenance-task-repository.port';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../../motorcycle/domain/ports/motorcycle-repository.port';
import { MaintenanceTask } from '../../domain/entities/maintenance-task.entity';
import { NotFoundException, ForbiddenException } from '../../../../shared/domain/exceptions';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(MAINTENANCE_TASK_REPOSITORY) private readonly taskRepo: MaintenanceTaskRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY) private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string, motorcycleId: string, taskId: string, params: {
    name?: string;
    description?: string;
    intervalHours?: number;
    isActive?: boolean;
  }): Promise<MaintenanceTask> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.userId !== userId) throw new ForbiddenException('Not your motorcycle');

    const task = await this.taskRepo.findById(taskId);
    if (!task || task.motorcycleId !== motorcycleId) throw new NotFoundException('Task not found');

    task.updateDetails(params);
    return this.taskRepo.save(task);
  }
}
```

```typescript
// backend/src/modules/maintenance/application/use-cases/delete-task.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MAINTENANCE_TASK_REPOSITORY, MaintenanceTaskRepositoryPort } from '../../domain/ports/maintenance-task-repository.port';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../../motorcycle/domain/ports/motorcycle-repository.port';
import { NotFoundException, ForbiddenException, ValidationException } from '../../../../shared/domain/exceptions';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject(MAINTENANCE_TASK_REPOSITORY) private readonly taskRepo: MaintenanceTaskRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY) private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string, motorcycleId: string, taskId: string): Promise<void> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.userId !== userId) throw new ForbiddenException('Not your motorcycle');

    const task = await this.taskRepo.findById(taskId);
    if (!task || task.motorcycleId !== motorcycleId) throw new NotFoundException('Task not found');
    if (task.isDefault) throw new ValidationException('Cannot delete default tasks. Deactivate instead.');

    await this.taskRepo.delete(taskId);
  }
}
```

- [ ] **Step 3: Create MaintenanceTaskController**

```typescript
// backend/src/modules/maintenance/infrastructure/controllers/maintenance-task.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { GetTaskDashboardUseCase } from '../../application/use-cases/get-task-dashboard.use-case';
import { CompleteTaskUseCase } from '../../application/use-cases/complete-task.use-case';
import { CreateCustomTaskUseCase } from '../../application/use-cases/create-custom-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task.use-case';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsDateString, Min, IsArray } from 'class-validator';

export class CreateTaskDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber() @Min(0.1) intervalHours: number;
}

export class UpdateTaskDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() @Min(0.1) intervalHours?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class CompleteTaskDto {
  @IsNumber() @Min(0) performedAtHours: number;
  @IsDateString() performedAtDate: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) photos?: string[];
}

@Controller('motorcycles/:motorcycleId/tasks')
@UseGuards(JwtAuthGuard)
export class MaintenanceTaskController {
  constructor(
    private readonly getTaskDashboard: GetTaskDashboardUseCase,
    private readonly completeTask: CompleteTaskUseCase,
    private readonly createCustomTask: CreateCustomTaskUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
  ) {}

  @Get()
  async list(@Req() req: any, @Param('motorcycleId') motorcycleId: string) {
    const results = await this.getTaskDashboard.execute(req.user.id, motorcycleId);
    return results.map((r) => ({
      id: r.task.id,
      name: r.task.name,
      description: r.task.description,
      intervalHours: r.task.intervalHours,
      lastServicedAtHours: r.task.lastServicedAtHours,
      isDefault: r.task.isDefault,
      isActive: r.task.isActive,
      status: r.status.status,
      hoursRemaining: r.status.hoursRemaining,
    }));
  }

  @Post()
  async create(@Req() req: any, @Param('motorcycleId') motorcycleId: string, @Body() dto: CreateTaskDto) {
    const task = await this.createCustomTask.execute(req.user.id, motorcycleId, dto);
    return { id: task.id, name: task.name, intervalHours: task.intervalHours, isDefault: task.isDefault };
  }

  @Patch(':taskId')
  async update(@Req() req: any, @Param('motorcycleId') motorcycleId: string, @Param('taskId') taskId: string, @Body() dto: UpdateTaskDto) {
    const task = await this.updateTask.execute(req.user.id, motorcycleId, taskId, dto);
    return { id: task.id, name: task.name, intervalHours: task.intervalHours, isActive: task.isActive };
  }

  @Post(':taskId/complete')
  async complete(@Req() req: any, @Param('motorcycleId') motorcycleId: string, @Param('taskId') taskId: string, @Body() dto: CompleteTaskDto) {
    const record = await this.completeTask.execute(req.user.id, motorcycleId, taskId, {
      performedAtHours: dto.performedAtHours,
      performedAtDate: new Date(dto.performedAtDate),
      notes: dto.notes,
      photos: dto.photos,
    });
    return { id: record.id, performedAtHours: record.performedAtHours, performedAtDate: record.performedAtDate };
  }

  @Delete(':taskId')
  async remove(@Req() req: any, @Param('motorcycleId') motorcycleId: string, @Param('taskId') taskId: string) {
    await this.deleteTask.execute(req.user.id, motorcycleId, taskId);
    return { deleted: true };
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/modules/maintenance/infrastructure/persistence/maintenance-task* backend/src/modules/maintenance/application/use-cases/ backend/src/modules/maintenance/infrastructure/controllers/maintenance-task.controller.ts
git commit -m "feat(backend): add Maintenance task infrastructure — ORM, use cases, controller"
```

---

## Task 9: Maintenance Module — Record Infrastructure & Application

**Files:**
- Create: `backend/src/modules/maintenance/infrastructure/persistence/maintenance-record.orm-entity.ts`
- Create: `backend/src/modules/maintenance/infrastructure/persistence/maintenance-record.mapper.ts`
- Create: `backend/src/modules/maintenance/infrastructure/persistence/maintenance-record.repository.ts`
- Create: `backend/src/modules/maintenance/application/use-cases/get-records.use-case.ts`
- Create: `backend/src/modules/maintenance/application/use-cases/get-record-detail.use-case.ts`
- Create: `backend/src/modules/maintenance/application/use-cases/edit-record.use-case.ts`
- Create: `backend/src/modules/maintenance/application/use-cases/delete-record.use-case.ts`
- Create: `backend/src/modules/maintenance/infrastructure/controllers/maintenance-record.controller.ts`
- Create: `backend/src/modules/maintenance/maintenance.module.ts`

- [ ] **Step 1: Create record ORM entity, mapper, repository**

```typescript
// backend/src/modules/maintenance/infrastructure/persistence/maintenance-record.orm-entity.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('maintenance_records')
export class MaintenanceRecordOrmEntity {
  @PrimaryColumn('uuid') id: string;
  @Column({ name: 'task_id', type: 'uuid' }) taskId: string;
  @Column({ name: 'motorcycle_id', type: 'uuid' }) motorcycleId: string;
  @Column({ name: 'performed_at_hours', type: 'decimal', precision: 10, scale: 1 }) performedAtHours: number;
  @Column({ name: 'performed_at_date', type: 'date' }) performedAtDate: Date;
  @Column({ nullable: true }) notes: string | null;
  @Column({ type: 'simple-array', nullable: true }) photos: string[] | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
```

```typescript
// backend/src/modules/maintenance/infrastructure/persistence/maintenance-record.mapper.ts
import { MaintenanceRecord } from '../../domain/entities/maintenance-record.entity';
import { MaintenanceRecordOrmEntity } from './maintenance-record.orm-entity';

export class MaintenanceRecordMapper {
  static toDomain(orm: MaintenanceRecordOrmEntity, currentMotorcycleHours: number = Infinity): MaintenanceRecord {
    return new MaintenanceRecord({
      id: orm.id,
      taskId: orm.taskId,
      motorcycleId: orm.motorcycleId,
      performedAtHours: Number(orm.performedAtHours),
      performedAtDate: new Date(orm.performedAtDate),
      currentMotorcycleHours,
      notes: orm.notes ?? undefined,
      photos: orm.photos ?? undefined,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: MaintenanceRecord): MaintenanceRecordOrmEntity {
    const orm = new MaintenanceRecordOrmEntity();
    orm.id = domain.id;
    orm.taskId = domain.taskId;
    orm.motorcycleId = domain.motorcycleId;
    orm.performedAtHours = domain.performedAtHours;
    orm.performedAtDate = domain.performedAtDate;
    orm.notes = domain.notes;
    orm.photos = domain.photos.length > 0 ? domain.photos : null;
    return orm;
  }
}
```

```typescript
// backend/src/modules/maintenance/infrastructure/persistence/maintenance-record.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRecordRepositoryPort } from '../../domain/ports/maintenance-record-repository.port';
import { MaintenanceRecord } from '../../domain/entities/maintenance-record.entity';
import { MaintenanceRecordOrmEntity } from './maintenance-record.orm-entity';
import { MaintenanceRecordMapper } from './maintenance-record.mapper';

@Injectable()
export class MaintenanceRecordRepository implements MaintenanceRecordRepositoryPort {
  constructor(
    @InjectRepository(MaintenanceRecordOrmEntity)
    private readonly repo: Repository<MaintenanceRecordOrmEntity>,
  ) {}

  async findById(id: string): Promise<MaintenanceRecord | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? MaintenanceRecordMapper.toDomain(orm) : null;
  }

  async findByMotorcycleId(motorcycleId: string, taskId?: string, page = 1, limit = 20): Promise<{ records: MaintenanceRecord[]; total: number }> {
    const where: any = { motorcycleId };
    if (taskId) where.taskId = taskId;
    const [orms, total] = await this.repo.findAndCount({
      where,
      order: { performedAtDate: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { records: orms.map((o) => MaintenanceRecordMapper.toDomain(o)), total };
  }

  async findLatestByTaskId(taskId: string): Promise<MaintenanceRecord | null> {
    const orm = await this.repo.findOne({
      where: { taskId },
      order: { performedAtHours: 'DESC' },
    });
    return orm ? MaintenanceRecordMapper.toDomain(orm) : null;
  }

  async findPreviousByTaskId(taskId: string, excludeRecordId: string): Promise<MaintenanceRecord | null> {
    const orm = await this.repo
      .createQueryBuilder('r')
      .where('r.task_id = :taskId', { taskId })
      .andWhere('r.id != :excludeRecordId', { excludeRecordId })
      .orderBy('r.performed_at_hours', 'DESC')
      .getOne();
    return orm ? MaintenanceRecordMapper.toDomain(orm) : null;
  }

  async save(record: MaintenanceRecord): Promise<MaintenanceRecord> {
    const orm = MaintenanceRecordMapper.toOrm(record);
    const saved = await this.repo.save(orm);
    return MaintenanceRecordMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async deleteByMotorcycleId(motorcycleId: string): Promise<void> {
    await this.repo.delete({ motorcycleId });
  }
}
```

- [ ] **Step 2: Create record use cases**

```typescript
// backend/src/modules/maintenance/application/use-cases/get-records.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MAINTENANCE_RECORD_REPOSITORY, MaintenanceRecordRepositoryPort } from '../../domain/ports/maintenance-record-repository.port';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../../motorcycle/domain/ports/motorcycle-repository.port';
import { MaintenanceRecord } from '../../domain/entities/maintenance-record.entity';
import { NotFoundException, ForbiddenException } from '../../../../shared/domain/exceptions';

@Injectable()
export class GetRecordsUseCase {
  constructor(
    @Inject(MAINTENANCE_RECORD_REPOSITORY) private readonly recordRepo: MaintenanceRecordRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY) private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string, motorcycleId: string, taskId?: string, page?: number, limit?: number): Promise<{ records: MaintenanceRecord[]; total: number }> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.userId !== userId) throw new ForbiddenException('Not your motorcycle');
    return this.recordRepo.findByMotorcycleId(motorcycleId, taskId, page, limit);
  }
}
```

```typescript
// backend/src/modules/maintenance/application/use-cases/get-record-detail.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MAINTENANCE_RECORD_REPOSITORY, MaintenanceRecordRepositoryPort } from '../../domain/ports/maintenance-record-repository.port';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../../motorcycle/domain/ports/motorcycle-repository.port';
import { MaintenanceRecord } from '../../domain/entities/maintenance-record.entity';
import { NotFoundException, ForbiddenException } from '../../../../shared/domain/exceptions';

@Injectable()
export class GetRecordDetailUseCase {
  constructor(
    @Inject(MAINTENANCE_RECORD_REPOSITORY) private readonly recordRepo: MaintenanceRecordRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY) private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string, motorcycleId: string, recordId: string): Promise<MaintenanceRecord> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.userId !== userId) throw new ForbiddenException('Not your motorcycle');

    const record = await this.recordRepo.findById(recordId);
    if (!record || record.motorcycleId !== motorcycleId) throw new NotFoundException('Record not found');
    return record;
  }
}
```

```typescript
// backend/src/modules/maintenance/application/use-cases/edit-record.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MAINTENANCE_RECORD_REPOSITORY, MaintenanceRecordRepositoryPort } from '../../domain/ports/maintenance-record-repository.port';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../../motorcycle/domain/ports/motorcycle-repository.port';
import { MaintenanceRecord } from '../../domain/entities/maintenance-record.entity';
import { NotFoundException, ForbiddenException } from '../../../../shared/domain/exceptions';

@Injectable()
export class EditRecordUseCase {
  constructor(
    @Inject(MAINTENANCE_RECORD_REPOSITORY) private readonly recordRepo: MaintenanceRecordRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY) private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string, motorcycleId: string, recordId: string, params: {
    performedAtHours?: number;
    performedAtDate?: Date;
    notes?: string;
    photos?: string[];
  }): Promise<MaintenanceRecord> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.userId !== userId) throw new ForbiddenException('Not your motorcycle');

    const record = await this.recordRepo.findById(recordId);
    if (!record || record.motorcycleId !== motorcycleId) throw new NotFoundException('Record not found');

    record.updateDetails({ ...params, currentMotorcycleHours: moto.currentHours });
    return this.recordRepo.save(record);
  }
}
```

```typescript
// backend/src/modules/maintenance/application/use-cases/delete-record.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { MAINTENANCE_RECORD_REPOSITORY, MaintenanceRecordRepositoryPort } from '../../domain/ports/maintenance-record-repository.port';
import { MAINTENANCE_TASK_REPOSITORY, MaintenanceTaskRepositoryPort } from '../../domain/ports/maintenance-task-repository.port';
import { MOTORCYCLE_REPOSITORY, MotorcycleRepositoryPort } from '../../../motorcycle/domain/ports/motorcycle-repository.port';
import { NotFoundException, ForbiddenException } from '../../../../shared/domain/exceptions';

@Injectable()
export class DeleteRecordUseCase {
  constructor(
    @Inject(MAINTENANCE_RECORD_REPOSITORY) private readonly recordRepo: MaintenanceRecordRepositoryPort,
    @Inject(MAINTENANCE_TASK_REPOSITORY) private readonly taskRepo: MaintenanceTaskRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY) private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string, motorcycleId: string, recordId: string): Promise<void> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.userId !== userId) throw new ForbiddenException('Not your motorcycle');

    const record = await this.recordRepo.findById(recordId);
    if (!record || record.motorcycleId !== motorcycleId) throw new NotFoundException('Record not found');

    const latest = await this.recordRepo.findLatestByTaskId(record.taskId);
    const isLatest = latest && latest.id === recordId;

    await this.recordRepo.delete(recordId);

    if (isLatest) {
      const task = await this.taskRepo.findById(record.taskId);
      if (task) {
        const previous = await this.recordRepo.findPreviousByTaskId(record.taskId, recordId);
        task.rollbackLastServiced(previous ? previous.performedAtHours : null);
        await this.taskRepo.save(task);
      }
    }
  }
}
```

- [ ] **Step 3: Create MaintenanceRecordController**

```typescript
// backend/src/modules/maintenance/infrastructure/controllers/maintenance-record.controller.ts
import { Controller, Get, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { GetRecordsUseCase } from '../../application/use-cases/get-records.use-case';
import { GetRecordDetailUseCase } from '../../application/use-cases/get-record-detail.use-case';
import { EditRecordUseCase } from '../../application/use-cases/edit-record.use-case';
import { DeleteRecordUseCase } from '../../application/use-cases/delete-record.use-case';
import { IsOptional, IsString, IsNumber, IsDateString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class EditRecordDto {
  @IsOptional() @IsNumber() performedAtHours?: number;
  @IsOptional() @IsDateString() performedAtDate?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) photos?: string[];
}

@Controller('motorcycles/:motorcycleId/records')
@UseGuards(JwtAuthGuard)
export class MaintenanceRecordController {
  constructor(
    private readonly getRecords: GetRecordsUseCase,
    private readonly getRecordDetail: GetRecordDetailUseCase,
    private readonly editRecord: EditRecordUseCase,
    private readonly deleteRecord: DeleteRecordUseCase,
  ) {}

  @Get()
  async list(
    @Req() req: any,
    @Param('motorcycleId') motorcycleId: string,
    @Query('taskId') taskId?: string,
    @Query('page', new Type(() => Number)) page?: number,
    @Query('limit', new Type(() => Number)) limit?: number,
  ) {
    const { records, total } = await this.getRecords.execute(req.user.id, motorcycleId, taskId, page || 1, limit || 20);
    return {
      records: records.map((r) => ({
        id: r.id, taskId: r.taskId, performedAtHours: r.performedAtHours,
        performedAtDate: r.performedAtDate, notes: r.notes, photos: r.photos,
      })),
      total,
      page: page || 1,
      limit: limit || 20,
    };
  }

  @Get(':recordId')
  async detail(@Req() req: any, @Param('motorcycleId') motorcycleId: string, @Param('recordId') recordId: string) {
    const r = await this.getRecordDetail.execute(req.user.id, motorcycleId, recordId);
    return { id: r.id, taskId: r.taskId, performedAtHours: r.performedAtHours, performedAtDate: r.performedAtDate, notes: r.notes, photos: r.photos };
  }

  @Patch(':recordId')
  async edit(@Req() req: any, @Param('motorcycleId') motorcycleId: string, @Param('recordId') recordId: string, @Body() dto: EditRecordDto) {
    const r = await this.editRecord.execute(req.user.id, motorcycleId, recordId, {
      performedAtHours: dto.performedAtHours,
      performedAtDate: dto.performedAtDate ? new Date(dto.performedAtDate) : undefined,
      notes: dto.notes,
      photos: dto.photos,
    });
    return { id: r.id, performedAtHours: r.performedAtHours, performedAtDate: r.performedAtDate, notes: r.notes, photos: r.photos };
  }

  @Delete(':recordId')
  async remove(@Req() req: any, @Param('motorcycleId') motorcycleId: string, @Param('recordId') recordId: string) {
    await this.deleteRecord.execute(req.user.id, motorcycleId, recordId);
    return { deleted: true };
  }
}
```

- [ ] **Step 4: Create maintenance.module.ts**

```typescript
// backend/src/modules/maintenance/maintenance.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceTaskOrmEntity } from './infrastructure/persistence/maintenance-task.orm-entity';
import { MaintenanceRecordOrmEntity } from './infrastructure/persistence/maintenance-record.orm-entity';
import { MaintenanceTaskRepository } from './infrastructure/persistence/maintenance-task.repository';
import { MaintenanceRecordRepository } from './infrastructure/persistence/maintenance-record.repository';
import { MAINTENANCE_TASK_REPOSITORY } from './domain/ports/maintenance-task-repository.port';
import { MAINTENANCE_RECORD_REPOSITORY } from './domain/ports/maintenance-record-repository.port';
import { MaintenanceCalculator } from './domain/services/maintenance-calculator.service';
import { DefaultTaskFactory } from './domain/services/default-task-factory.service';
import { GetTaskDashboardUseCase } from './application/use-cases/get-task-dashboard.use-case';
import { CompleteTaskUseCase } from './application/use-cases/complete-task.use-case';
import { CreateCustomTaskUseCase } from './application/use-cases/create-custom-task.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { GetRecordsUseCase } from './application/use-cases/get-records.use-case';
import { GetRecordDetailUseCase } from './application/use-cases/get-record-detail.use-case';
import { EditRecordUseCase } from './application/use-cases/edit-record.use-case';
import { DeleteRecordUseCase } from './application/use-cases/delete-record.use-case';
import { MaintenanceTaskController } from './infrastructure/controllers/maintenance-task.controller';
import { MaintenanceRecordController } from './infrastructure/controllers/maintenance-record.controller';
import { MotorcycleModule } from '../motorcycle/motorcycle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceTaskOrmEntity, MaintenanceRecordOrmEntity]),
    forwardRef(() => MotorcycleModule),
  ],
  controllers: [MaintenanceTaskController, MaintenanceRecordController],
  providers: [
    { provide: MAINTENANCE_TASK_REPOSITORY, useClass: MaintenanceTaskRepository },
    { provide: MAINTENANCE_RECORD_REPOSITORY, useClass: MaintenanceRecordRepository },
    MaintenanceCalculator,
    DefaultTaskFactory,
    GetTaskDashboardUseCase,
    CompleteTaskUseCase,
    CreateCustomTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    GetRecordsUseCase,
    GetRecordDetailUseCase,
    EditRecordUseCase,
    DeleteRecordUseCase,
  ],
  exports: [MAINTENANCE_TASK_REPOSITORY, MAINTENANCE_RECORD_REPOSITORY, DefaultTaskFactory],
})
export class MaintenanceModule {}
```

- [ ] **Step 5: Register MaintenanceModule in AppModule**

Add to imports in `backend/src/app.module.ts`:

```typescript
import { MotorcycleModule } from './modules/motorcycle/motorcycle.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';

// add to imports array:
MotorcycleModule,
MaintenanceModule,
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/modules/maintenance/ backend/src/app.module.ts
git commit -m "feat(backend): add Maintenance record infrastructure — ORM, use cases, controller, module wiring"
```

---

## Task 10: File Storage

**Files:**
- Create: `backend/src/shared/infrastructure/file-storage/file-storage.port.ts`
- Create: `backend/src/shared/infrastructure/file-storage/local-file-storage.adapter.ts`

- [ ] **Step 1: Create FileStoragePort**

```typescript
// backend/src/shared/infrastructure/file-storage/file-storage.port.ts
export const FILE_STORAGE = Symbol('FILE_STORAGE');

export interface FileStoragePort {
  upload(file: Buffer, filename: string): Promise<string>;
  getUrl(filename: string): string;
  delete(filename: string): Promise<void>;
}
```

- [ ] **Step 2: Create LocalFileStorageAdapter**

```typescript
// backend/src/shared/infrastructure/file-storage/local-file-storage.adapter.ts
import { Injectable } from '@nestjs/common';
import { FileStoragePort } from './file-storage.port';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LocalFileStorageAdapter implements FileStoragePort {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  async upload(file: Buffer, filename: string): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const filepath = path.join(this.uploadDir, filename);
    await fs.writeFile(filepath, file);
    return filename;
  }

  getUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  async delete(filename: string): Promise<void> {
    const filepath = path.join(this.uploadDir, filename);
    await fs.unlink(filepath).catch(() => {});
  }
}
```

- [ ] **Step 3: Serve static uploads in main.ts**

Add to `bootstrap()` in `backend/src/main.ts`:

```typescript
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// change create to:
const app = await NestFactory.create<NestExpressApplication>(AppModule);

// after enableCors():
app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/shared/infrastructure/file-storage/ backend/src/main.ts
git commit -m "feat(backend): add file storage port with local adapter"
```

---

## Task 11: Notification Module (Stub)

**Files:**
- Create: `backend/src/modules/notification/domain/ports/notification.port.ts`
- Create: `backend/src/modules/notification/infrastructure/firebase-notification.adapter.ts`
- Create: `backend/src/modules/notification/notification.module.ts`

- [ ] **Step 1: Create NotificationPort**

```typescript
// backend/src/modules/notification/domain/ports/notification.port.ts
export const NOTIFICATION_PORT = Symbol('NOTIFICATION_PORT');

export interface NotificationPort {
  sendPush(deviceToken: string, title: string, body: string): Promise<void>;
}
```

- [ ] **Step 2: Create stub adapter (logs for MVP)**

```typescript
// backend/src/modules/notification/infrastructure/firebase-notification.adapter.ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationPort } from '../domain/ports/notification.port';

@Injectable()
export class FirebaseNotificationAdapter implements NotificationPort {
  private readonly logger = new Logger(FirebaseNotificationAdapter.name);

  async sendPush(deviceToken: string, title: string, body: string): Promise<void> {
    this.logger.log(`[STUB] Push notification: token=${deviceToken}, title="${title}", body="${body}"`);
  }
}
```

- [ ] **Step 3: Create notification.module.ts**

```typescript
// backend/src/modules/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { NOTIFICATION_PORT } from './domain/ports/notification.port';
import { FirebaseNotificationAdapter } from './infrastructure/firebase-notification.adapter';

@Module({
  providers: [
    { provide: NOTIFICATION_PORT, useClass: FirebaseNotificationAdapter },
  ],
  exports: [NOTIFICATION_PORT],
})
export class NotificationModule {}
```

- [ ] **Step 4: Register in AppModule**

```typescript
import { NotificationModule } from './modules/notification/notification.module';

// add to imports:
NotificationModule,
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/notification/ backend/src/app.module.ts
git commit -m "feat(backend): add Notification module with stub Firebase adapter"
```

---

## Task 12: Run All Tests

- [ ] **Step 1: Run full test suite**

Run: `cd /home/user/projects/mts/backend && npx jest --verbose`
Expected: All tests pass (BaseEntity, exceptions, User entity, GoogleProvider entity, Motorcycle entity, MaintenanceTask entity, MaintenanceRecord entity, TaskStatus VO)

- [ ] **Step 2: Verify app compiles**

Run: `cd /home/user/projects/mts/backend && npx nest build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Final commit**

```bash
git add -A backend/
git commit -m "feat(backend): complete backend implementation — all modules wired"
```
