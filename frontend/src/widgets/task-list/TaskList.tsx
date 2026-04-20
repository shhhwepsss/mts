import { Link } from 'react-router-dom';
import { Card, StatusBadge, EmptyState } from '@/shared/ui';
import { formatHours } from '@/shared/lib';
import type { TaskListProps } from './type/task-list.type';
import styles from './TaskList.module.css';

export function TaskList({ motorcycleId, tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState message="No tasks yet." />;
  }

  return (
    <div className={styles.list}>
      {tasks.map((task) => (
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
                  Every {formatHours(task.intervalHours)} ·{' '}
                  {task.hoursRemaining >= 0
                    ? `${formatHours(task.hoursRemaining)} remaining`
                    : `${formatHours(-task.hoursRemaining)} overdue`}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
