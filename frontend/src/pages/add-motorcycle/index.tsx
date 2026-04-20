import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motorcycleApi } from '@/entities/motorcycle';
import { MotorcycleForm } from '@/features/create-motorcycle';
import { Header } from '@/widgets/header';

export function AddMotorcyclePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: motorcycleApi.create,
    onSuccess: (m) => {
      queryClient.invalidateQueries({ queryKey: ['motorcycles'] });
      navigate(`/garage/${m.id}`);
    },
  });

  return (
    <>
      <Header />
      <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>Add Motorcycle</h1>
        <MotorcycleForm
          submitLabel="Add to Garage"
          isSubmitting={mutation.isPending}
          onSubmit={(params) => mutation.mutate(params)}
          onCancel={() => navigate('/garage')}
        />
        {mutation.isError && (
          <p style={{ color: 'var(--action-danger)', marginTop: 16 }}>
            Failed to create motorcycle. Please try again.
          </p>
        )}
      </div>
    </>
  );
}
