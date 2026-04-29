import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { taskApi } from '@/entities/task';
import { motorcycleApi } from '@/entities/motorcycle';
import { Spinner } from '@/shared/ui';
import { useI18n } from '@/shared/i18n';
import { Header } from '@/widgets/header';
import { CompleteTaskForm } from '@/features/complete-task';

export function CompleteTaskPage() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();

  const tasksQuery = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskApi.listByMotorcycle(id!),
    enabled: !!id,
  });

  const motorcycleQuery = useQuery({
    queryKey: ['motorcycle', id],
    queryFn: () => motorcycleApi.getById(id!),
    enabled: !!id,
  });

  const task = tasksQuery.data?.find((t) => t.id === taskId);
  const motorcycle = motorcycleQuery.data;

  if (tasksQuery.isLoading || motorcycleQuery.isLoading) {
    return (
      <>
        <Header />
        <Spinner />
      </>
    );
  }

  if (!task || !motorcycle) {
    return (
      <>
        <Header />
        <div style={{ padding: 24 }}>{t('completeTaskPage.notFound')}</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ padding: 24, maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 8 }}>{t('completeTaskPage.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{task.name}</p>
        <CompleteTaskForm
          motorcycleId={id!}
          task={task}
          defaultHours={motorcycle.currentHours}
          onSuccess={() => navigate(`/garage/${id}`)}
          onCancel={() => navigate(`/garage/${id}/tasks/${taskId}`)}
        />
      </div>
    </>
  );
}
