import { useNavigate } from "react-router-dom";
import CourseCard from "../../general/course/CourseCard";
import styles from "./DashboardSettings.module.css";
import { IoCloudUploadOutline } from "react-icons/io5";
import { authService, courseService } from "../../../services";
import { useEffect, useState } from "react";
import { pastelGradientFromString } from "../../../utils/colors";
import type { Course } from "../../../schemas/course";
import toast from "react-hot-toast";
import CourseConfigPanel from "../../general/courseConfig/CourseConfigPanel";

export default function DashboardSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ uuid: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    avatar_path: "",
  });
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [configCourseId, setConfigCourseId] = useState<string | null>(null);

  // Cargar usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getCurrentUser();
        setUser(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          password: "",
          avatar_path: data.avatar_path || "",
        });
      } catch (err) {
        console.error("Error al obtener usuario:", err);
      }
    };
    fetchUser();
  }, []);

  // Cargar cursos creados
  useEffect(() => {
    const fetchCreatedCourses = async () => {
      try {
        setLoadingCourses(true);
        const courses = await courseService.getCreatedCourses();
        setCreatedCourses(courses || []);
      } catch (err) {
        console.error("Error al obtener cursos creados:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCreatedCourses();
  }, []);

  // Manejar Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Actualizar Usuario
  const handleUpdate = async () => {
    try {
      await authService.updateUser(formData);
      toast.success("Cuenta actualizada correctamente");
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar la cuenta");
    }
  };

  const handleDelete = async () => {
    toast(
      (t) => (
        <div className={styles.toastConfirm}>
          <p>¿Seguro de que deseas eliminar tu cuenta?</p>
          <div className={styles.toastButtons}>
            <button
              className={styles.btnCancel}
              onClick={() => toast.dismiss(t.id)}
            >
              Cancelar
            </button>
            <button
              className={styles.btnDelete}
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await authService.deleteAccount();
                  toast.success("Cuenta eliminada correctamente.");
                  navigate("/auth");
                } catch (err: any) {
                  toast.error(err.message || "Error al eliminar cuenta");
                }
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  return (
    <div className={styles.settings}>
      <h1>Configuración</h1>
      <hr />

      <section className={styles.profile}>
        <div className={styles.photoSection}>
          <p>Tu foto de perfil</p>
          <div className={styles.photoBox}>
            <IoCloudUploadOutline size={24} />
            <span>Actualiza tu foto de perfil</span>
          </div>
          <p className={styles.uuid}>
            UUID: {user ? user.uuid : "Cargando UUID..."}
          </p>
        </div>

        <div className={styles.inputs}>
          <label>
            Nombre
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ingrese su nombre"
            />
          </label>
          <label>
            Correo
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="holapezjaja@gmail.com"
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </label>
          <label>
            Avatar
            <input
              type="text"
              name="avatar_path"
              value={formData.avatar_path}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>
        </div>
      </section>

      <hr />

      <section className={styles.courses}>
        <h2>Cursos Creados</h2>
        {loadingCourses ? (
          <p>Cargando cursos...</p>
        ) : createdCourses.length > 0 ? (
          <div className={styles.cards}>
            {createdCourses.map((course) => (
              <CourseCard
                key={course.uuid}
                title={course.title}
                color={pastelGradientFromString(course.title)}
                progress={0}
                icon="settings"
                logo_path={course.logo_path}
                variant="compact"
                onIconClick={() => setConfigCourseId(course.uuid)}
              />
            ))}
          </div>
        ) : (
          <p>No has creado cursos todavía.</p>
        )}
      </section>

      <div className={styles.actions}>
        <button className={styles.update} onClick={handleUpdate}>
          Actualizar
        </button>
        <button className={styles.delete} onClick={handleDelete}>
          Eliminar Cuenta
        </button>
      </div>
      {configCourseId && (
        <CourseConfigPanel
          courseId={configCourseId}
          onClose={() => setConfigCourseId(null)}
          onUpdated={() => {
            setConfigCourseId(null);
            // Refrescar los cursos actualizados
            (async () => {
              const courses = await courseService.getCreatedCourses();
              setCreatedCourses(courses || []);
            })();
          }}
        />
      )}
    </div>
  );
}
