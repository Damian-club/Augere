import { IoAdd } from "react-icons/io5";
import styles from "./AddCourse.module.css";

export default function AddCourseCard() {
  return (
    <div className={styles.card}>
      <IoAdd className={styles.icon} size={32} />
      <p className={styles.text}>¿No encuentras lo que buscas?</p>
      <span className={styles.subtext}>Unirse a un curso nuevo</span>
    </div>
  );
}
