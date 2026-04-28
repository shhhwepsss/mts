import { ValidationException } from '@/shared/domain/exceptions';

export class StringValidator {
  static nonEmpty(value: string, field: string): void {
    if (!value || value.trim().length === 0) {
      throw new ValidationException(`${field} must not be empty`);
    }
  }

  static maxLength(value: string, field: string, max: number): void {
    if (value.length > max) {
      throw new ValidationException(
        `${field} must not exceed ${max} characters`,
      );
    }
  }

  static email(value: string, field: string): void {
    StringValidator.nonEmpty(value, field);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ValidationException(`${field} format is invalid`);
    }
  }

  static nullableNonEmpty(value: string | null, field: string): void {
    if (value !== null && value.trim().length === 0) {
      throw new ValidationException(`${field} must not be empty`);
    }
  }
}
