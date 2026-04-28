import { BaseEntity } from '@/shared/domain/base.entity';
import { IllegalStateException } from '@/shared/domain/exceptions';

class TestEntity extends BaseEntity {
  constructor(
    id: string,
    createdAt: Date | null = null,
    updatedAt: Date | null = null,
  ) {
    super(id, createdAt, updatedAt);
  }
}

describe('BaseEntity', () => {
  it('should store provided id', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const entity = new TestEntity(id);
    expect(entity.getId()).toBe(id);
  });

  it('should throw if empty id provided', () => {
    const emptyTrimmedId = '';
    const emptyId = ' ';
    expect(() => new TestEntity(emptyId)).toThrow(IllegalStateException);
    expect(() => new TestEntity(emptyTrimmedId)).toThrow(IllegalStateException);
  });

  it('should set createdAt and updatedAt', () => {
    const entity = new TestEntity('some-id');
    expect(entity.getCreatedAt()).toBeInstanceOf(Date);
    expect(entity.getUpdatedAt()).toBeInstanceOf(Date);
  });

  it('should use provided dates when given', () => {
    const created = new Date('2025-01-01');
    const updated = new Date('2025-06-01');
    const entity = new TestEntity('some-id', created, updated);
    expect(entity.getCreatedAt()).toBe(created);
    expect(entity.getUpdatedAt()).toBe(updated);
  });

  it('should validate created is before updated', () => {
    const created = new Date('2025-02-01');
    const updated = new Date('2025-01-01');
    expect(() => new TestEntity('some-id', created, updated)).toThrow(
      IllegalStateException,
    );
  });

  it('should not expose fields directly', () => {
    const entity = new TestEntity('some-id');
    expect(entity).not.toHaveProperty('id');
    expect(entity).not.toHaveProperty('createdAt');
    expect(entity).not.toHaveProperty('updatedAt');
  });
});
