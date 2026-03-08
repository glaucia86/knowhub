import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';

interface AuthenticatedPrincipal {
  sub?: string;
  userId?: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedPrincipal }>();
    const userId = request.user?.userId ?? request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user context is required');
    }
    return userId;
  },
);
