import type { EmptyStateProps } from './type/empty-state.type';

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
      <p>{message}</p>
    </div>
  );
}
