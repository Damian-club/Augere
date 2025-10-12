import styles from "./DashboardHome.module.css";

export default function DashboardHome() {
  const progress = 40;

  return (
    <div className={styles.dashboardHome}>
      <h1>Inicio</h1>
      <h2>Bienvenido de vuelta, Diego</h2>

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
            <strong>2/4</strong> completados
          </p>
          <p>Tu progreso total en los cursos</p>
        </div>

        {/* Lista de cursos con progreso */}
        <div className={styles.courseList}>
          <div className={styles.courseRow}>
            <span>Algoritmos</span>
            <div className={styles.bar}>
              <div style={{ width: "80%" }} />
            </div>
          </div>
          <div className={styles.courseRow}>
            <span>Lógica y diagramas</span>
            <div className={styles.bar}>
              <div style={{ width: "40%" }} />
            </div>
          </div>
          <div className={styles.courseRow}>
            <span>Computación</span>
            <div className={styles.bar}>
              <div style={{ width: "60%" }} />
            </div>
          </div>
          <div className={styles.courseRow}>
            <span>Historia de la computación</span>
            <div className={styles.bar}>
              <div style={{ width: "20%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Seccion Detallada */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h3>4</h3>
          <p>Cursos activos</p>
        </div>
        <div className={styles.summaryCard}>
          <h3>12h</h3>
          <p>Tiempo de estudio</p>
        </div>
        <div className={styles.summaryCard}>
          <h3>8.7</h3>
          <p>Puntaje promedio</p>
        </div>
      </div>
    </div>
  );
}
