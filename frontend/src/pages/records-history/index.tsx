import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recordApi } from '@/entities/record';
import { Spinner } from '@/shared/ui';
import { Header } from '@/widgets/header';
import { RecordList } from '@/widgets/record-list';

export function RecordsHistoryPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['records', id],
    queryFn: () => recordApi.list(id!),
    enabled: !!id,
  });

  return (
    <>
      <Header />
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>Records</h1>
        {isLoading && <Spinner />}
        {error && <p style={{ color: 'var(--action-danger)' }}>Could not load records.</p>}
        {data && <RecordList motorcycleId={id!} records={data.records} />}
      </div>
    </>
  );
}
