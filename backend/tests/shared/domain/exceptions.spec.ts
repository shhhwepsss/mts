import {
  DomainException,
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from '@/shared/domain/exceptions';

describe('Domain Exceptions', () => {
  it('DomainException has message and code', () => {
    const error = new DomainException('something broke', 'DOMAIN_ERROR');
    expect(error.message).toBe('something broke');
    expect(error.getCode()).toBe('DOMAIN_ERROR');
  });

  it('ValidationException defaults code to VALIDATION_ERROR', () => {
    const error = new ValidationException('invalid input');
    expect(error.getCode()).toBe('VALIDATION_ERROR');
  });

  it('NotFoundException defaults code to NOT_FOUND', () => {
    const error = new NotFoundException('user not found');
    expect(error.getCode()).toBe('NOT_FOUND');
  });

  it('ForbiddenException defaults code to FORBIDDEN', () => {
    const error = new ForbiddenException('not allowed');
    expect(error.getCode()).toBe('FORBIDDEN');
  });
});
