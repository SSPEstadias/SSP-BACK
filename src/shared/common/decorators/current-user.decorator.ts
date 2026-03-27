import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Extrae el userId del token JWT ya validado por JwtAuthGuard.
// Uso: @CurrentUser() userId: number
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return (req.user as { userId: number }).userId;
  },
);
