import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, type Task } from '@/entities/task';
import { Button, TextInput } from '@/shared/ui';

interface CompleteTaskFormProps {
  motorcycleId: string;
  task: Task;
  defaultHours: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CompleteTaskForm({
  motorcycleId,
  task,
  defaultHours,
  onSuccess,
  onCancel,
}: CompleteTaskFormProps) {
  const queryClient = useQueryClient();
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
    if (!Number.isFinite(parsed) || parsed < 0) next.hours = 'Hours must be a non-negative number';
    if (!date) next.date = 'Date is required';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TextInput
        label="Performed at Hours"
        type="number"
        step="0.1"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        error={errors.hours}
      />
      <TextInput
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />
      <TextInput
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Complete Task'}
        </Button>
      </div>
      {mutation.isError && (
        <p style={{ color: 'var(--action-danger)', fontSize: 13 }}>Failed to complete task. Try again.</p>
      )}
    </form>
  );
}
