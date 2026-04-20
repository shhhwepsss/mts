import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motorcycleApi } from '@/entities/motorcycle';
import { Button, Modal, TextInput } from '@/shared/ui';

interface LogHoursModalProps {
  motorcycleId: string;
  currentHours: number;
  isOpen: boolean;
  onClose: () => void;
}

export function LogHoursModal({ motorcycleId, currentHours, isOpen, onClose }: LogHoursModalProps) {
  const queryClient = useQueryClient();
  const [hours, setHours] = useState(String(currentHours));
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (value: number) => motorcycleApi.updateHours(motorcycleId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motorcycle', motorcycleId] });
      queryClient.invalidateQueries({ queryKey: ['motorcycles'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', motorcycleId] });
      onClose();
    },
    onError: () => setError('Could not update hours. Try again.'),
  });

  const handleSubmit = () => {
    setError(null);
    const parsed = Number(hours);
    if (!Number.isFinite(parsed) || parsed < currentHours) {
      setError(`Hours must be ≥ current (${currentHours}h)`);
      return;
    }
    mutation.mutate(parsed);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Hours">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextInput
          label="Current Hours"
          type="number"
          step="0.1"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          error={error ?? undefined}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
