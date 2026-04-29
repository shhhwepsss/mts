import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/entities/task';
import { motorcycleApi } from '@/entities/motorcycle';
import { Button, Spinner, StatusBadge } from '@/shared/ui';
import { useI18n } from '@/shared/i18n';
import { Header } from '@/widgets/header';

export function TaskDetailPage() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, formatHours } = useI18n();

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

  const deleteMutation = useMutation({
    mutationFn: () => taskApi.delete(id!, taskId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      navigate(`/garage/${id}`);
    },
  });

  const task = tasksQuery.data?.find((t) => t.id === taskId);

  if (tasksQuery.isLoading || motorcycleQuery.isLoading) {
    return (
      <>
        <Header />
        <Spinner />
      </>
    );
  }

  if (!task) {
    return (
      <>
        <Header />
        <div style={{ padding: 24 }}>{t('taskDetail.notFound')}</div>
      </>
    );
  }

  const remainingLabel =
    task.status === 'NEED_TO_COMPLETE'
      ? t('taskDetail.serviceRequiredNow')
      : task.hoursRemaining >= 0
        ? t('taskDetail.untilService', { hours: formatHours(task.hoursRemaining) })
        : t('taskDetail.overdueBy', { hours: formatHours(-task.hoursRemaining) });

  return (
    <>
      <Header />
      <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <StatusBadge status={task.status} />
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{task.name}</h1>
        </div>
        {task.description && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{task.description}</p>
        )}
        <dl style={{ display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: 12, marginBottom: 32 }}>
          <dt style={{ color: 'var(--text-secondary)' }}>{t('taskDetail.interval')}</dt>
          <dd>{formatHours(task.intervalHours)}</dd>
          <dt style={{ color: 'var(--text-secondary)' }}>{t('taskDetail.lastServiced')}</dt>
          <dd>
            {task.lastServicedAtHours !== null
              ? formatHours(task.lastServicedAtHours)
              : t('taskDetail.never')}
          </dd>
          <dt style={{ color: 'var(--text-secondary)' }}>{t('taskDetail.remaining')}</dt>
          <dd>{remainingLabel}</dd>
        </dl>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button onClick={() => navigate(`/garage/${id}/tasks/${taskId}/complete`)}>
            {t('taskDetail.complete')}
          </Button>
          <Button variant="outline" onClick={() => navigate(`/garage/${id}`)}>
            {t('common.back')}
          </Button>
          {!task.isDefault && (
            <Button
              variant="danger"
              onClick={() => {
                if (confirm(t('taskDetail.deleteConfirm'))) deleteMutation.mutate();
              }}
            >
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
