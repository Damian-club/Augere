import { useEffect, useState } from "react";
import type { Course, StudentSummary } from "../../../schemas/course";
import style from "./CourseStudentsTab.module.css";
import { courseService, schemaService } from "../../../services";
import { IoEyeOutline } from "react-icons/io5";
import StudentReviewPanel from "../student/StudentReviewPanel";

type Props = {
  course: Course;
};

export default function CourseStudentsTab({ course }: Props) {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentProgressMap, setStudentProgressMap] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Traer resumen privado del curso
        const data = await courseService.getPrivateSummary(course.uuid);
        const studentList = data.student_list || [];

        // Traer esquema del curso
        const schema = await schemaService.getFullSchemaByCourse(course.uuid);
        const entryUuids = schema.category_list.flatMap((cat) =>
          cat.entry_list.map((e) => e.uuid)
        );

        // Calcular progreso de cada estudiante
        const progressMap: Record<string, number> = {};
        studentList.forEach((student) => {
          if (!student.uuid) return;

          const finishedCount =
            student.progress_list?.filter(
              (p) => entryUuids.includes(p.entry_uuid) && p.finished
            ).length || 0;

          progressMap[student.uuid] = entryUuids.length
            ? Math.round((finishedCount / entryUuids.length) * 100)
            : 0;
        });

        setStudents(studentList);
        setStudentProgressMap(progressMap);
      } catch (err) {
        console.error("Error al cargar estudiantes: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [course.uuid]);

  if (loading) return <div className={style.loader}>Cargando alumnos...</div>;

  if (!students.length)
    return (
      <div className={style.emptyState}>
        <p>No hay alumnos inscritos en el curso</p>
      </div>
    );

  return (
    <>
      <div className={style.studentsContainer}>
        <h3 className={style.title}>Lista de estudiantes</h3>
        <div className={style.tableWrapper}>
          <table className={style.studentsTable}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Completitud</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => {
                const percentage = Math.round(
                  (student.completion_percentage || 0) * 100
                );

                return (
                  <tr key={student.name + index}>
                    <td>{student.name}</td>
                    <td>
                      <div className={style.progressBar}>
                        <div
                          className={style.progressFill}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                      <span className={style.progressText}>
                        {percentage}%
                      </span>
                    </td>
                    <td className={style.tdActions}>
                      <button
                        className={style.actionButton}
                        onClick={() => setSelectedStudent(student.name)}
                      >
                        <IoEyeOutline />
                        Revisar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedStudent && (
          <StudentReviewPanel
            studentName={selectedStudent}
            courseUuid={course.uuid}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </div>

      <div className={style.exportButtons}>
        <button
          className={`${style.exportButton} ${style.excelButton}`}
          onClick={async () =>
            await courseService.downloadExcel(course.uuid, course.title)
          }
        >
          Generar Excel
        </button>
        <button
          className={`${style.exportButton} ${style.csvButton}`}
          onClick={async () =>
            await courseService.downloadCSV(course.uuid, course.title)
          }
        >
          Generar CSV
        </button>
      </div>
    </>
  );
}
