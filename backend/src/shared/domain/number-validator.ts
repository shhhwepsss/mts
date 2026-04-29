import { ValidationException } from '@/shared/domain/exceptions';

export class NumberValidator {
  static integer(value: number, field: string): void {
    if (!Number.isInteger(value)) {
      throw new ValidationException(`${field} must be an integer`);
    }
  }

  static nonNegative(value: number, field: string): void {
    if (value < 0) {
      throw new ValidationException(`${field} must not be negative`);
    }
  }
}
