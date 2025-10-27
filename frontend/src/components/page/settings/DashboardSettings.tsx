import { useNavigate } from "react-router-dom";
import CourseCard from "../../general/course/CourseCard";
import styles from "./DashboardSettings.module.css";
import { IoCloudUploadOutline } from "react-icons/io5";
import { authService } from "../../../services";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../../api/auth";

export default function DashboardSettings() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<{ uuid: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    avatar_path: "",
  });

  // Cargar usuario actual
  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        setUser(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          password: "",
          avatar_path: data.avatar_path || "",
        });
      })
      .catch((err) => console.log(err));
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
      setMessage("Cuenta actualizada correctamente");
    } catch (err: any) {
      setMessage(err.message || "Error al actualizar la cuenta");
    }
  };

  // Manejar Delete
  const handleDelete = async () => {
    const confirmDelete = confirm("¿Seguro de que deseas eliminar tu cuenta?");

    if (!confirmDelete) return;

    try {
      await authService.deleteAccount();
      setMessage("Cuenta eliminada correctamente.");
      navigate("/auth");
    } catch (err: any) {
      setMessage(err.message || "Error al eliminar cuenta");
    }
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
            Contraseña (opcional)
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </label>
          <label>
            Avatar (URL)
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
        <div className={styles.cards}>
          <CourseCard
            title="Computación"
            progress={80}
            color="linear-gradient(135deg, #f9a8d4, #ec4899)"
            icon="settings"
            variant="compact"
          />
        </div>
      </section>

      <div className={styles.actions}>
        <button className={styles.update} onClick={handleUpdate}>
          Actualizar
        </button>
        <button className={styles.delete} onClick={handleDelete}>
          Eliminar Cuenta
        </button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
