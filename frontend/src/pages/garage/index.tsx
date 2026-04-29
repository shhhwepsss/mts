import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motorcycleApi } from '@/entities/motorcycle';
import { useI18n } from '@/shared/i18n';
import { Header } from '@/widgets/header';
import { MotorcycleCard } from '@/widgets/motorcycle-card';
import { Button, EmptyState, Spinner } from '@/shared/ui';
import styles from './GaragePage.module.css';

export function GaragePage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { data, isLoading, error } = useQuery({
    queryKey: ['motorcycles'],
    queryFn: motorcycleApi.list,
  });

  return (
    <>
      <Header />
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('garage.title')}</h1>
          <Button onClick={() => navigate('/garage/add')}>{t('garage.addMotorcycle')}</Button>
        </div>

        {isLoading && <Spinner />}
        {error && <p className={styles.error}>{t('garage.loadError')}</p>}
        {data && data.length === 0 && <EmptyState message={t('garage.empty')} />}
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
