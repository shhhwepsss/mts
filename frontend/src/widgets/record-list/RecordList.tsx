import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState } from "@/shared/ui";
import { formatHours, formatDate } from "@/shared/lib";
import { taskApi } from "@/entities/task";
import type { RecordListProps } from "./type/record-list.type";
import styles from "./RecordList.module.css";

export function RecordList({ motorcycleId, records }: RecordListProps) {
  const { data: tasks } = useQuery({
    queryKey: ["tasks", motorcycleId],
    queryFn: () => taskApi.listByMotorcycle(motorcycleId),
  });

  const tasksById = new Map(tasks?.map((t) => [t.id, t]) ?? []);

  if (records.length === 0) {
    return <EmptyState message="No maintenance records yet." />;
  }

  return (
    <div className={styles.list}>
      {records.map((record) => {
        const task = tasksById.get(record.taskId);
        return (
          <Link
            key={record.id}
            to={`/garage/${motorcycleId}/records/${record.id}`}
            className={styles.link}
          >
            <Card>
              <div className={styles.row}>
                <div className={styles.content}>
                  <p className={styles.taskName}>
                    {task?.name ?? "Unknown task"}
                  </p>
                  <p className={styles.date}>
                    {formatDate(new Date(record.performedAtDate))}
                  </p>
                  <p className={styles.hours}>
                    Preformed at: {formatHours(record.performedAtHours)}
                  </p>
                  {record.notes && (
                    <p className={styles.notes}>{record.notes}</p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
