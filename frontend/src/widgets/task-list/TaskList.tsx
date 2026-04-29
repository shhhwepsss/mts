import { Link } from 'react-router-dom';
import { Card, StatusBadge, EmptyState } from '@/shared/ui';
import { useI18n } from '@/shared/i18n';
import type { TaskListProps } from './type/task-list.type';
import { formatRemaining } from './lib/format-remaining.lib';
import { sortTasks } from './lib/sort-tasks.lib';
import styles from './TaskList.module.css';

export function TaskList({ motorcycleId, tasks }: TaskListProps) {
  const { t, formatHours } = useI18n();

  if (tasks.length === 0) {
    return <EmptyState message={t('taskList.empty')} />;
  }

  const sortedTasks = sortTasks(tasks);

  return (
    <div className={styles.list}>
      {sortedTasks.map((task) => (
        <Link
          key={task.id}
          to={`/garage/${motorcycleId}/tasks/${task.id}`}
          className={styles.link}
        >
          <Card>
            <div className={styles.row}>
              <StatusBadge status={task.status} />
              <div className={styles.content}>
                <h4 className={styles.name}>{task.name}</h4>
                <p className={styles.meta}>
                  {t('taskList.everyInterval', {
                    interval: formatHours(task.intervalHours),
                    remaining: formatRemaining(task, t, formatHours),
                  })}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
