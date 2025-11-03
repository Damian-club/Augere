import { useEffect, useState } from "react";
import styles from "./DashboardHome.module.css";
import { authService, courseService } from "../../../services";

type OverviewData = {
  completion_percentage: number;
  completed_count: number;
  total_count: number;
  course_list: { name: string; completion_percentage: number }[];
};

export default function DashboardHome() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);

        const overviewData = await courseService.getOverview();
        setOverview(overviewData);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className={styles.loader}>Cargando datos...</div>;
  }

  if (!overview) {
    return (
      <div className={styles.emptyState}>
        <p>No hay datos disponibles aún.</p>
      </div>
    );
  }

  const progress = overview.completion_percentage || 0;

  return (
    <div className={styles.dashboardHome}>
      <h1>Inicio</h1>
      <h2>Bienvenido de vuelta, {user ? user.name : "Cargando..."}</h2>

      <div className={styles.content}>
        {/* Progreso Circular */}
        <div className={styles.progressCard}>
          <div
            className={styles.circle}
            style={{ "--progress": `${progress}%` } as React.CSSProperties}
          >
            <span>{progress}%</span>
          </div>
          <p>
            <strong>
              {overview.completed_count}/{overview.total_count}
            </strong>{" "}
            completados
          </p>
          <p>Tu progreso total en los cursos</p>
        </div>

        {/* Lista de cursos con progreso */}
        <div className={styles.courseList}>
          {overview.course_list.map((course, i) => (
            <div key={i} className={styles.courseRow}>
              <span>{course.name}</span>
              <div className={styles.bar}>
                <div style={{ width: `${course.completion_percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección Resumen */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h3>{overview.total_count}</h3>
          <p>Cursos activos</p>
        </div>
      </div>
    </div>
  );
}
