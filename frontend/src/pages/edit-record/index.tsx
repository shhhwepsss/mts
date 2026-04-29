import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recordApi } from '@/entities/record';
import { Spinner } from '@/shared/ui';
import { useI18n } from '@/shared/i18n';
import { Header } from '@/widgets/header';
import { EditRecordForm } from '@/features/edit-record';

export function EditRecordPage() {
  const { id, recordId } = useParams<{ id: string; recordId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ['record', id, recordId],
    queryFn: () => recordApi.getById(id!, recordId!),
    enabled: !!id && !!recordId,
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
      <div style={{ padding: 24, maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>{t('editRecordPage.title')}</h1>
        <EditRecordForm
          motorcycleId={id!}
          record={data}
          onSuccess={() => navigate(`/garage/${id}/records/${recordId}`)}
          onCancel={() => navigate(`/garage/${id}/records/${recordId}`)}
        />
      </div>
    </>
  );
}
