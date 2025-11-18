import { useEffect, useState } from "react";
import { IoClose, IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";
import { schemaService, courseService } from "../../../services";
import styles from "./StudentReviewPanel.module.css";

type Props = {
  studentName: string;
  courseUuid: string;
  onClose: () => void;
};

type EntryProgress = {
  name: string;
  finished: boolean;
};

export default function StudentReviewPanel({
  studentName,
  courseUuid,
  onClose,
}: Props) {
  const [entries, setEntries] = useState<EntryProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);

        const schema = await schemaService.getFullSchemaByCourse(courseUuid);
        const entryList = schema.category_list.flatMap((cat) =>
          cat.entry_list.map((e) => ({ uuid: e.uuid, name: e.name }))
        );

        const courseSummary = await courseService.getPrivateSummary(courseUuid);
        const student = courseSummary.student_list?.find(
          (s) => s.name === studentName
        );

        const entryProgress: EntryProgress[] = entryList.map((e) => ({
          name: e.name,
          finished:
            student?.progress_list?.some(
              (p) => p.entry_uuid === e.uuid && p.finished
            ) || false,
        }));

        setEntries(entryProgress);
      } catch (err) {
        console.error("Error cargando progreso del estudiante:", err);
      } finally {
        setLoading(false);
      }
    };

    if (studentName) loadProgress();
  }, [studentName, courseUuid]);

  const finishedCount = entries.filter((e) => e.finished).length;
  const totalCount = entries.length;
  const percentage =
    totalCount > 0 ? Math.round((finishedCount / totalCount) * 100) : 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Progreso del estudiante</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <IoClose size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <h3 className={styles.studentName}>{studentName}</h3>

          {loading ? (
            <div className={styles.loader}>Cargando progreso...</div>
          ) : entries.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No hay entradas disponibles para este curso.</p>
            </div>
          ) : (
            <>
              <div className={styles.statsBar}>
                <div className={styles.statItem}>
                  <span className={`${styles.statValue} ${styles.finished}`}>
                    {finishedCount}
                  </span>
                  <span className={styles.statLabel}>Completadas</span>
                </div>
                <div className={styles.statItem}>
                  <span className={`${styles.statValue} ${styles.pending}`}>
                    {totalCount - finishedCount}
                  </span>
                  <span className={styles.statLabel}>Pendientes</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{percentage}%</span>
                  <span className={styles.statLabel}>Progreso</span>
                </div>
              </div>

              <ul className={styles.entryList}>
                {entries.map((e, i) => (
                  <li
                    key={i}
                    className={`${styles.entryItem} ${
                      e.finished
                        ? styles.entryItemFinished
                        : styles.entryItemPending
                    }`}
                  >
                    <span
                      className={`${styles.entryIcon} ${
                        e.finished ? styles.finished : styles.pending
                      }`}
                    >
                      {e.finished ? <IoCheckmarkCircle /> : <IoCloseCircle />}
                    </span>
                    <span className={styles.entryName}>{e.name}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
