import { User } from '../../../../../src/modules/user/domain/entities/user.entity';
import { ValidationException } from '../../../../../src/shared/domain/exceptions';

describe('User Entity', () => {
  it('should create a valid user', () => {
    const user = new User({ name: 'John Doe', email: 'john@example.com' });
    expect(user.getName()).toBe('John Doe');
    expect(user.getEmail()).toBe('john@example.com');
    expect(user.getId()).toBeDefined();
  });

  it('should reject empty name', () => {
    expect(() => new User({ name: '', email: 'john@example.com' })).toThrow(
      ValidationException,
    );
  });

  it('should reject name longer than 100 characters', () => {
    const longName = 'a'.repeat(101);
    expect(
      () => new User({ name: longName, email: 'john@example.com' }),
    ).toThrow(ValidationException);
  });

  it('should reject empty email', () => {
    expect(() => new User({ name: 'John', email: '' })).toThrow(
      ValidationException,
    );
  });

  it('should reject invalid email format', () => {
    expect(() => new User({ name: 'John', email: 'not-an-email' })).toThrow(
      ValidationException,
    );
  });

  it('should reject email longer than 100 characters', () => {
    const longEmail = 'a'.repeat(90) + '@example.com';
    expect(() => new User({ name: 'John', email: longEmail })).toThrow(
      ValidationException,
    );
  });

  it('should allow optional avatarUrl', () => {
    const user = new User({
      name: 'John',
      email: 'john@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
    });
    expect(user.getAvatarUrl()).toBe('https://example.com/avatar.jpg');
  });

  it('should update name', () => {
    const user = new User({ name: 'John', email: 'john@example.com' });
    user.updateName('Jane');
    expect(user.getName()).toBe('Jane');
  });

  it('should reject updating to empty name', () => {
    const user = new User({ name: 'John', email: 'john@example.com' });
    expect(() => user.updateName('')).toThrow(ValidationException);
  });
});
