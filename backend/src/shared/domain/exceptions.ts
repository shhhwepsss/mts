export class DomainException extends Error {
  private readonly _code: string;

  constructor(message: string, code: string = 'DOMAIN_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this._code = code;
  }

  getCode(): string {
    return this._code;
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
