import { useEffect, useState } from "react";
import style from "./StudentReviewPanel.module.css";
import { IoClose } from "react-icons/io5";
import { schemaService, courseService } from "../../../services";
import type { StudentProgress } from "../../../schemas/course";

type Props = {
  studentUuid: string;
  courseUuid: string;
  onClose: () => void;
};

type EntryProgress = {
  name: string;
  finished: boolean;
};

export default function StudentReviewPanel({ studentUuid, courseUuid, onClose }: Props) {
  const [entries, setEntries] = useState<EntryProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);

        // Obtener esquema del curso
        const schema = await schemaService.getFullSchemaByCourse(courseUuid);
        const entryList = schema.category_list.flatMap(cat =>
          cat.entry_list.map(e => ({ uuid: e.uuid, name: e.name }))
        );

        // Obtener resumen privado del curso para acceder al progress_list
        const courseSummary = await courseService.getPrivateSummary(courseUuid);
        const student = courseSummary.student_list?.find(s => s.uuid === studentUuid);

        const entryProgress: EntryProgress[] = entryList.map(e => ({
          name: e.name,
          finished: student?.progress_list?.some(p => p.entry_uuid === e.uuid && p.finished) || false
        }));

        setEntries(entryProgress);
      } catch (err) {
        console.error("Error cargando progreso del estudiante:", err);
      } finally {
        setLoading(false);
      }
    };

    if (studentUuid) loadProgress();
  }, [studentUuid, courseUuid]);

  if (loading) return <div className={style.loader}>Cargando progreso...</div>;

  return (
    <div className={style.overlay}>
      <div className={style.panel}>
        <div className={style.header}>
          <h2>Revisión del estudiante</h2>
          <button className={style.closeBtn} onClick={onClose}>
            <IoClose size={22} />
          </button>
        </div>

        <div className={style.content}>
          <h3 className={style.studentName}>Progreso del estudiante</h3>
          {entries.length === 0 ? (
            <p>No hay entradas disponibles.</p>
          ) : (
            <ul className={style.entryList}>
              {entries.map((e, i) => (
                <li key={i} className={e.finished ? style.finished : ""}>
                  {e.name} {e.finished ? "(✔)" : "(✖)"}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
