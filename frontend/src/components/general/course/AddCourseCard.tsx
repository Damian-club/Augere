import { IoAdd } from "react-icons/io5";
import styles from "./AddCourse.module.css";
import { useState } from "react";
import CourseModal from "./CourseModal";

export default function AddCourseCard() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <div className={styles.card}>
        <IoAdd className={styles.icon} size={32} />
        <p className={styles.text}>¿No encuentras lo que buscas?</p>
        <span className={styles.subtext}>Unirse a un curso nuevo</span>
      </div>

      {isOpen && <CourseModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
