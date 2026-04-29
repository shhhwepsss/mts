import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { motorcycleApi } from '@/entities/motorcycle';
import { MotorcycleForm } from '@/features/create-motorcycle';
import { useI18n } from '@/shared/i18n';
import { Header } from '@/widgets/header';
import { Spinner } from '@/shared/ui';

export function EditMotorcyclePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ['motorcycle', id],
    queryFn: () => motorcycleApi.getById(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (params: Parameters<typeof motorcycleApi.update>[1]) =>
      motorcycleApi.update(id!, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motorcycles'] });
      queryClient.invalidateQueries({ queryKey: ['motorcycle', id] });
      navigate(`/garage/${id}`);
    },
  });

  return (
    <>
      <Header />
      <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>{t('editMotorcyclePage.title')}</h1>
        {isLoading && <Spinner />}
        {data && (
          <MotorcycleForm
            initialValue={data}
            submitLabel={t('motorcycleForm.saveChanges')}
            isSubmitting={mutation.isPending}
            onSubmit={(params) => mutation.mutate(params)}
            onCancel={() => navigate(`/garage/${id}`)}
          />
        )}
      </div>
    </>
  );
}
