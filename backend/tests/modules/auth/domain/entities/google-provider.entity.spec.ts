import { GoogleProvider } from '@/modules/auth/domain/entities/google-provider.entity';
import { ValidationException } from '@/shared/domain/exceptions';

describe('GoogleProvider Entity', () => {
  it('should create a valid google provider', () => {
    const provider = new GoogleProvider({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      googleUserId: 'google-123',
      googleEmail: 'john@gmail.com',
    });
    expect(provider.getGoogleUserId()).toBe('google-123');
    expect(provider.getGoogleEmail()).toBe('john@gmail.com');
  });

  it('should reject empty googleUserId', () => {
    expect(
      () =>
        new GoogleProvider({
          userId: '123',
          googleUserId: '',
          googleEmail: 'john@gmail.com',
        }),
    ).toThrow(ValidationException);
  });

  it('should reject empty googleEmail', () => {
    expect(
      () =>
        new GoogleProvider({
          userId: '123',
          googleUserId: 'google-123',
          googleEmail: '',
        }),
    ).toThrow(ValidationException);
  });

  it('should allow optional googleAvatarUrl', () => {
    const provider = new GoogleProvider({
      userId: '123',
      googleUserId: 'google-123',
      googleEmail: 'john@gmail.com',
      googleAvatarUrl: 'https://lh3.googleusercontent.com/photo.jpg',
    });
    expect(provider.getGoogleAvatarUrl()).toBe(
      'https://lh3.googleusercontent.com/photo.jpg',
    );
  });
});
