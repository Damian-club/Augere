import CourseCard from "../../general/course/CourseCard";
import styles from "./DashboardSettings.module.css";
import { IoCloudUploadOutline } from "react-icons/io5";

export default function DashboardSettings() {
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
          <p className={styles.uuid}>UUID: a07-ad02-j17-78e8b73b-ac/ac</p>
        </div>

        <div className={styles.inputs}>
          <label>
            Nombre
            <input type="text" placeholder="Ingrese su nombre" />
          </label>
          <label>
            Correo
            <input type="email" placeholder="holapezjaja@gmail.com" />
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
        <button className={styles.update}>Actualizar</button>
        <button className={styles.delete}>Eliminar Cuenta</button>
      </div>
    </div>
  );
}
