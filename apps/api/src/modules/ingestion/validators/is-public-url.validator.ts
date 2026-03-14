import { lookup } from 'node:dns/promises';
import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

const PRIVATE_IP_RANGES: RegExp[] = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fd[0-9a-f]{2}:/i,
];

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((regex) => regex.test(ip));
}

@ValidatorConstraint({ name: 'IsPublicUrl', async: true })
export class IsPublicUrlConstraint implements ValidatorConstraintInterface {
  async validate(value: unknown): Promise<boolean> {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return false;
    }

    try {
      const { hostname } = new URL(value);
      const result = await lookup(hostname);
      return !isPrivateIp(result.address);
    } catch {
      return false;
    }
  }

  defaultMessage(_args?: ValidationArguments): string {
    return 'URLs pointing to private or loopback IP addresses are not allowed';
  }
}

export function IsPublicUrl(options?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    registerDecorator({
      name: 'IsPublicUrl',
      target: target.constructor,
      propertyName: String(propertyKey),
      options,
      validator: IsPublicUrlConstraint,
    });
  };
}
