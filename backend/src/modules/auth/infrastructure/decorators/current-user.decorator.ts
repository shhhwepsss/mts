import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '@/modules/auth/infrastructure/decorators/authenticated-user.type';

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as { id: unknown }).id === 'string'
  );
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user: unknown = request.user;
    if (!isAuthenticatedUser(user)) {
      throw new Error('CurrentUser used on a route without an auth guard');
    }
    return user;
  },
);
