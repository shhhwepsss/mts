import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motorcycleApi } from '@/entities/motorcycle';
import { Header } from '@/widgets/header';
import { MotorcycleCard } from '@/widgets/motorcycle-card';
import { Button, EmptyState, Spinner } from '@/shared/ui';
import styles from './GaragePage.module.css';

export function GaragePage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['motorcycles'],
    queryFn: motorcycleApi.list,
  });

  return (
    <>
      <Header />
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Garage</h1>
          <Button onClick={() => navigate('/garage/add')}>+ Add Motorcycle</Button>
        </div>

        {isLoading && <Spinner />}
        {error && <p className={styles.error}>Could not load your garage. Try again.</p>}
        {data && data.length === 0 && (
          <EmptyState message="Your garage is empty — add your first motorcycle to get started." />
        )}
        {data && data.length > 0 && (
          <div className={styles.grid}>
            {data.map((m) => (
              <MotorcycleCard key={m.id} motorcycle={m} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
