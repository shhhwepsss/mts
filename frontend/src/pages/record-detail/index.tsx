import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recordApi } from '@/entities/record';
import { Button, Spinner } from '@/shared/ui';
import { useI18n } from '@/shared/i18n';
import { Header } from '@/widgets/header';

export function RecordDetailPage() {
  const { id, recordId } = useParams<{ id: string; recordId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, formatDate, formatHours } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ['record', id, recordId],
    queryFn: () => recordApi.getById(id!, recordId!),
    enabled: !!id && !!recordId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => recordApi.delete(id!, recordId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      navigate(`/garage/${id}/records`);
    },
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <Spinner />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header />
        <div style={{ padding: 24 }}>{t('recordDetail.notFound')}</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 8 }}>{formatDate(new Date(data.performedAtDate))}</h1>
        <p style={{ color: 'var(--accent)', marginBottom: 24 }}>{formatHours(data.performedAtHours)}</p>
        {data.notes && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', marginBottom: 8 }}>
              {t('recordDetail.notes')}
            </h3>
            <p>{data.notes}</p>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => navigate(`/garage/${id}/records/${recordId}/edit`)}>
            {t('common.edit')}
          </Button>
          <Button variant="outline" onClick={() => navigate(`/garage/${id}/records`)}>
            {t('common.back')}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm(t('recordDetail.deleteConfirm'))) deleteMutation.mutate();
            }}
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>
    </>
  );
}
