import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordApi, type MaintenanceRecord } from '@/entities/record';
import { Button, TextInput } from '@/shared/ui';

interface EditRecordFormProps {
  motorcycleId: string;
  record: MaintenanceRecord;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditRecordForm({ motorcycleId, record, onSuccess, onCancel }: EditRecordFormProps) {
  const queryClient = useQueryClient();
  const [hours, setHours] = useState(String(record.performedAtHours));
  const [date, setDate] = useState(record.performedAtDate.slice(0, 10));
  const [notes, setNotes] = useState(record.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      recordApi.edit(motorcycleId, record.id, {
        performedAtHours: Number(hours),
        performedAtDate: date,
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', motorcycleId] });
      queryClient.invalidateQueries({ queryKey: ['record', motorcycleId, record.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', motorcycleId] });
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
        label="Hours"
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
        label="Notes"
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
          {mutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
