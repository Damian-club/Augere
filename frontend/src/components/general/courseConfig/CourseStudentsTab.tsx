import { useEffect, useState } from "react";
import type { Course, StudentSummary } from "../../../schemas/course";
import style from "./CourseStudentsTab.module.css";
import { courseService } from "../../../services";
import { IoEyeOutline } from "react-icons/io5";
import StudentReviewPanel from "../student/StudentReviewPanel";

type Props = {
  course: Course;
};

export default function CourseStudentsTab({ course }: Props) {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await courseService.getPrivateSummary(course.uuid);
        setStudents(data.student_list || []);
      } catch (err) {
        console.log("Error al cargar estudiantes: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [course.uuid]);

  if (loading) {
    return <div className={style.loader}>Cargando alumnos...</div>;
  }

  if (!students.length) {
    return (
      <div className={style.emptyState}>
        <p>No hay alumnos incristos en el curso</p>
      </div>
    );
  }

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
              {students.map((student, i) => (
                <tr key={i}>
                  <td>{student.name}</td>
                  <td>
                    <div className={style.progressBar}>
                      <div
                        className={style.progressFill}
                        style={{ width: `${student.completion_percentage}%` }}
                      ></div>
                    </div>
                    <span className={style.progressText}>
                      {student.completion_percentage}%
                    </span>
                  </td>
                  <td className={style.tdActions}>
                    <button
                      className={style.actionButton}
                      onClick={() => {
                        console.log("Click en revisar student: ", student.uuid);
                        setSelectedStudent(student.name);
                      }}
                    >
                      <IoEyeOutline />
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedStudent && (
          <StudentReviewPanel
            studentName={selectedStudent}
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
