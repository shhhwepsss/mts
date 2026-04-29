import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motorcycleApi } from '@/entities/motorcycle';
import { Button, Modal, TextInput } from '@/shared/ui';
import { useI18n } from '@/shared/i18n';
import type { LogHoursModalProps } from './type/log-hours-modal.type';

export function LogHoursModal({ motorcycleId, currentHours, isOpen, onClose }: LogHoursModalProps) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
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
    onError: () => setError(t('logHours.updateError')),
  });

  const handleSubmit = () => {
    setError(null);
    const parsed = Number(hours);
    if (!Number.isFinite(parsed) || parsed < currentHours) {
      setError(t('logHours.minError', { current: currentHours }));
      return;
    }
    mutation.mutate(parsed);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('logHours.title')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextInput
          label={t('logHours.currentHours')}
          type="number"
          step="0.1"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          error={error ?? undefined}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
