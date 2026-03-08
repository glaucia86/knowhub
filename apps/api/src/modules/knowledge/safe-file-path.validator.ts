import path from 'node:path';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

const ALLOWED_FILE_EXTENSIONS = new Set(['.pdf', '.txt', '.md']);

function isSafeRelativeFilePath(value: string): boolean {
  if (path.isAbsolute(value)) {
    return false;
  }

  const normalized = path.normalize(value);
  if (normalized.startsWith('..') || normalized.includes(`..${path.sep}`)) {
    return false;
  }

  return ALLOWED_FILE_EXTENSIONS.has(path.extname(normalized).toLowerCase());
}

@ValidatorConstraint({ name: 'isSafeFilePath', async: false })
export class SafeFilePathConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value == null || value === '') {
      return true;
    }

    return typeof value === 'string' && isSafeRelativeFilePath(value);
  }

  defaultMessage(_validationArguments?: ValidationArguments): string {
    return 'filePath must be a safe relative path ending with .pdf, .txt, or .md';
  }
}

export function IsSafeFilePath(validationOptions?: ValidationOptions) {
  return (target: object, propertyName: string): void => {
    registerDecorator({
      target: target.constructor,
      propertyName,
      options: validationOptions,
      validator: SafeFilePathConstraint,
    });
  };
}

export { isSafeRelativeFilePath };
