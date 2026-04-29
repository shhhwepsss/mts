import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/entities/task';
import { Button, TextInput } from '@/shared/ui';
import { useI18n } from '@/shared/i18n';
import type { CompleteTaskFormProps } from './type/complete-task-form.type';

export function CompleteTaskForm({
  motorcycleId,
  task,
  defaultHours,
  onSuccess,
  onCancel,
}: CompleteTaskFormProps) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [hours, setHours] = useState(String(defaultHours));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      taskApi.complete(motorcycleId, task.id, {
        performedAtHours: Number(hours),
        performedAtDate: date,
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', motorcycleId] });
      queryClient.invalidateQueries({ queryKey: ['records', motorcycleId] });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const parsed = Number(hours);
    if (!Number.isFinite(parsed) || parsed < 0) {
      next.hours = t('completeTaskPage.errors.hoursNonNegative');
    }
    if (!date) next.date = t('completeTaskPage.errors.dateRequired');
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TextInput
        label={t('completeTaskPage.performedAtHours')}
        type="number"
        step="0.1"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        error={errors.hours}
      />
      <TextInput
        label={t('completeTaskPage.date')}
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />
      <TextInput
        label={t('completeTaskPage.notesOptional')}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? t('common.saving') : t('completeTaskPage.submit')}
        </Button>
      </div>
      {mutation.isError && (
        <p style={{ color: 'var(--action-danger)', fontSize: 13 }}>{t('completeTaskPage.failed')}</p>
      )}
    </form>
  );
}
