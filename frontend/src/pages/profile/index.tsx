import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/entities/user';
import { useAuth } from '@/shared/auth';
import { useI18n } from '@/shared/i18n';
import { Button, TextInput } from '@/shared/ui';
import { Header } from '@/widgets/header';

export function ProfilePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name: name.trim() });
  };

  return (
    <>
      <Header />
      <div style={{ padding: 24, maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>{t('profile.title')}</h1>
        {user && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextInput label={t('profile.email')} value={user.email} disabled />
            <TextInput label={t('profile.name')} value={name} onChange={(e) => setName(e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </div>
            {saved && <p style={{ color: 'var(--status-ok)', fontSize: 13 }}>{t('common.saved')}</p>}
          </form>
        )}
      </div>
    </>
  );
}
