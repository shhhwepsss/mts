import { GoogleProvider } from '@/modules/auth/domain/entities/google-provider.entity';
import { ValidationException } from '@/shared/domain/exceptions';

describe('GoogleProvider Entity', () => {
  const baseProps = {
    id: null,
    googleAvatarUrl: null,
    createdAt: null,
  };

  it('should create a valid google provider', () => {
    const provider = new GoogleProvider({
      ...baseProps,
      userId: '123e4567-e89b-12d3-a456-426614174000',
      googleUserId: 'google-123',
      googleEmail: 'john@gmail.com',
    });
    expect(provider.getGoogleUserId()).toBe('google-123');
    expect(provider.getGoogleEmail()).toBe('john@gmail.com');
  });

  it('should reject empty userId', () => {
    expect(
      () =>
        new GoogleProvider({
          ...baseProps,
          userId: '',
          googleUserId: '123',
          googleEmail: 'john@gmail.com',
        }),
    ).toThrow(ValidationException);
    expect(
      () =>
        new GoogleProvider({
          ...baseProps,
          userId: ' ',
          googleUserId: '123',
          googleEmail: 'john@gmail.com',
        }),
    ).toThrow(ValidationException);
  });

  it('should reject empty googleUserId', () => {
    expect(
      () =>
        new GoogleProvider({
          ...baseProps,
          userId: '123',
          googleUserId: '',
          googleEmail: 'john@gmail.com',
        }),
    ).toThrow(ValidationException);
    expect(
      () =>
        new GoogleProvider({
          ...baseProps,
          userId: '123',
          googleUserId: ' ',
          googleEmail: 'john@gmail.com',
        }),
    ).toThrow(ValidationException);
  });

  it('should reject empty googleEmail', () => {
    expect(
      () =>
        new GoogleProvider({
          ...baseProps,
          userId: '123',
          googleUserId: 'google-123',
          googleEmail: '',
        }),
    ).toThrow(ValidationException);
    expect(
      () =>
        new GoogleProvider({
          ...baseProps,
          userId: '123',
          googleUserId: 'google-123',
          googleEmail: ' ',
        }),
    ).toThrow(ValidationException);
  });

  it('should reject invalid googleEmail', () => {
    expect(
      () =>
        new GoogleProvider({
          ...baseProps,
          userId: '123',
          googleUserId: 'google-123',
          googleEmail: 'john.gmail.com',
        }),
    ).toThrow(ValidationException);
  });

  it('should reject empty googleAvatarUrl', () => {
    expect(
      () =>
        new GoogleProvider({
          ...baseProps,
          userId: '123',
          googleUserId: 'google-123',
          googleEmail: 'john@gmail.com',
          googleAvatarUrl: '',
        }),
    ).toThrow(ValidationException);
    expect(
      () =>
        new GoogleProvider({
          ...baseProps,
          userId: '123',
          googleUserId: 'google-123',
          googleEmail: 'john@gmail.com',
          googleAvatarUrl: ' ',
        }),
    ).toThrow(ValidationException);
  });

  it('should allow nullable googleAvatarUrl', () => {
    const provider = new GoogleProvider({
      ...baseProps,
      userId: '123',
      googleUserId: 'google-123',
      googleEmail: 'john@gmail.com',
      googleAvatarUrl: null,
    });
    expect(provider.getGoogleAvatarUrl()).toBe(null);
  });
});
