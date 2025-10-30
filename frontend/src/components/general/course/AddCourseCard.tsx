import { IoAdd } from "react-icons/io5";
import styles from "./AddCourse.module.css";
import { useState } from "react";
import CourseModal from "./CourseModal";
import type { Course } from "../../../schemas/course";

export default function AddCourseCard({
  onCreated,
}: {
  onCreated?: (c: Course) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className={styles.card} onClick={() => setIsOpen(true)}>
        <IoAdd className={styles.icon} size={32} />
        <p className={styles.text}>¿No encuentras lo que buscas?</p>
        <span className={styles.subtext}>Unirse a un curso nuevo</span>
      </div>

      {isOpen && (
        <CourseModal onClose={() => setIsOpen(false)} onCreated={onCreated} />
      )}
    </>
  );
}
