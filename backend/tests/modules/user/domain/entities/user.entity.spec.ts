import { User } from '@/modules/user/domain/entities/user.entity';
import { ValidationException } from '@/shared/domain/exceptions';

describe('User Entity', () => {
  const baseProps = {
    id: null,
    avatarUrl: null,
    createdAt: null,
    updatedAt: null,
  };

  it('should create a valid user', () => {
    const user = new User({
      ...baseProps,
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(user.getName()).toBe('John Doe');
    expect(user.getEmail()).toBe('john@example.com');
    expect(user.getId()).toBeDefined();
  });

  it('should reject empty name', () => {
    expect(
      () => new User({ ...baseProps, name: '', email: 'john@example.com' }),
    ).toThrow(ValidationException);
    expect(
      () => new User({ ...baseProps, name: ' ', email: 'john@example.com' }),
    ).toThrow(ValidationException);
  });

  it('should reject name longer than 100 characters', () => {
    const longName = 'a'.repeat(101);
    expect(
      () =>
        new User({ ...baseProps, name: longName, email: 'john@example.com' }),
    ).toThrow(ValidationException);
  });

  it('should reject invalid email', () => {
    expect(() => new User({ ...baseProps, name: 'John', email: '' })).toThrow(
      ValidationException,
    );
    expect(() => new User({ ...baseProps, name: 'John', email: ' ' })).toThrow(
      ValidationException,
    );
    expect(
      () => new User({ ...baseProps, name: 'John', email: 'not-an-email' }),
    ).toThrow(ValidationException);
    const longEmail = 'a'.repeat(90) + '@example.com';
    expect(
      () => new User({ ...baseProps, name: 'John', email: longEmail }),
    ).toThrow(ValidationException);
  });

  it('should allow optional avatarUrl', () => {
    const user = new User({
      ...baseProps,
      name: 'John',
      email: 'john@example.com',
      avatarUrl: null,
    });
    expect(user.getAvatarUrl()).toBe(null);
  });

  it('should reject invalid avatarUrl', () => {
    expect(
      () =>
        new User({
          ...baseProps,
          name: 'John',
          email: 'john@example.com',
          avatarUrl: '',
        }),
    ).toThrow(ValidationException);
    expect(
      () =>
        new User({
          ...baseProps,
          name: 'John',
          email: 'john@example.com',
          avatarUrl: ' ',
        }),
    ).toThrow(ValidationException);
  });

  it('should reject updating invalid name', () => {
    const user = new User({
      ...baseProps,
      name: 'John',
      email: 'john@example.com',
    });
    expect(() => user.updateName('')).toThrow(ValidationException);
    expect(() => user.updateName(' ')).toThrow(ValidationException);
    expect(() => user.updateName('a'.repeat(101))).toThrow(ValidationException);
  });

  it('should update name', () => {
    const user = new User({
      ...baseProps,
      name: 'John',
      email: 'john@example.com',
    });
    user.updateName('Jane');
    expect(user.getName()).toBe('Jane');
  });
});
