import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui';
import { useI18n } from '@/shared/i18n';
import type { MotorcycleCardProps } from './type/motorcycle-card.type';
import styles from './MotorcycleCard.module.css';

export function MotorcycleCard({ motorcycle, overdueCount = 0, dueSoonCount = 0 }: MotorcycleCardProps) {
  const navigate = useNavigate();
  const { t, formatHours } = useI18n();

  const borderColor =
    overdueCount > 0
      ? 'var(--status-overdue)'
      : dueSoonCount > 0
        ? 'var(--status-due-soon)'
        : 'var(--status-ok)';

  const overdueLabel =
    overdueCount === 1
      ? t('motorcycleCard.overdueOne', { count: overdueCount })
      : t('motorcycleCard.overdueMany', { count: overdueCount });

  return (
    <Card borderColor={borderColor} onClick={() => navigate(`/garage/${motorcycle.id}`)}>
      <div className={styles.inner}>
        {motorcycle.imageUrl && (
          <img src={motorcycle.imageUrl} alt={motorcycle.name} className={styles.image} />
        )}
        <div className={styles.content}>
          <h3 className={styles.name}>{motorcycle.name}</h3>
          <p className={styles.meta}>
            {motorcycle.brand} {motorcycle.model} · {motorcycle.year}
          </p>
          <p className={styles.hours}>{formatHours(motorcycle.currentHours)}</p>
          {overdueCount > 0 && <p className={styles.overdue}>{overdueLabel}</p>}
          {overdueCount === 0 && dueSoonCount > 0 && (
            <p className={styles.dueSoon}>
              {t('motorcycleCard.dueSoon', { count: dueSoonCount })}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
