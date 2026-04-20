import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motorcycleApi } from "@/entities/motorcycle";
import { taskApi } from "@/entities/task";
import { Button, Spinner } from "@/shared/ui";
import { formatHours } from "@/shared/lib";
import { Header } from "@/widgets/header";
import { TaskList } from "@/widgets/task-list";
import { LogHoursModal } from "@/features/log-hours";
import styles from "./MotorcycleDetail.module.css";

export function MotorcycleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [logHoursOpen, setLogHoursOpen] = useState(false);

  const motorcycleQuery = useQuery({
    queryKey: ["motorcycle", id],
    queryFn: () => motorcycleApi.getById(id!),
    enabled: !!id,
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => taskApi.listByMotorcycle(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => motorcycleApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motorcycles"] });
      navigate("/garage");
    },
  });

  const handleDelete = () => {
    if (confirm("Delete this motorcycle? This cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  if (motorcycleQuery.isLoading || tasksQuery.isLoading) {
    return (
      <>
        <Header />
        <Spinner />
      </>
    );
  }

  const motorcycle = motorcycleQuery.data;
  const tasks = tasksQuery.data ?? [];

  if (!motorcycle) {
    return (
      <>
        <Header />
        <div className={styles.wrapper}>
          <p>Motorcycle not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.wrapper}>
        <div className={styles.topRow}>
          <div>
            <h1 className={styles.title}>{motorcycle.name}</h1>
            <p className={styles.meta}>
              {motorcycle.brand} {motorcycle.model} · {motorcycle.year} ·{" "}
              {motorcycle.type}
            </p>
            <p className={styles.hoursTitle}>
              Current moto hours:{" "}
              <span className={styles.hours}>
                {formatHours(motorcycle.currentHours)}
              </span>
            </p>
          </div>
          <div className={styles.actions}>
            <Button onClick={() => setLogHoursOpen(true)}>Log Hours</Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/garage/${id}/edit`)}
            >
              Edit
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tasks</h2>
            <Link to={`/garage/${id}/records`} className={styles.sectionLink}>
              View records →
            </Link>
          </div>
          <TaskList motorcycleId={id!} tasks={tasks} />
        </div>

        <LogHoursModal
          motorcycleId={id!}
          currentHours={motorcycle.currentHours}
          isOpen={logHoursOpen}
          onClose={() => setLogHoursOpen(false)}
        />
      </div>
    </>
  );
}
