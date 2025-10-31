import { IoAdd } from "react-icons/io5";
import styles from "./AddCourse.module.css";
import { useState } from "react";
import CourseModal from "./CourseModal";
import type { Course } from "../../../schemas/course";

type Props = {
  mode: "create" | "join";
  onCreated?: (c: Course) => void;
  onJoined?: () => void;
};

export default function AddCourseCard({ mode, onCreated, onJoined }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className={styles.card} onClick={() => setIsOpen(true)}>
        <IoAdd className={styles.icon} size={32} />
        {mode === "create" ? (
          <>
            <p className={styles.text}>¿Deseas crear un nuevo curso?</p>
            <span className={styles.subtext}>Haz clic para comenzar</span>
          </>
        ) : (
          <>
            <p className={styles.text}>¿Tienes un código de invitación?</p>
            <span className={styles.subtext}>Únete a un curso existente</span>
          </>
        )}
      </div>

      {isOpen && (
        <CourseModal
          mode={mode}
          onClose={() => setIsOpen(false)}
          onCreated={onCreated}
          onJoined={onJoined}
        />
      )}
    </>
  );
}
