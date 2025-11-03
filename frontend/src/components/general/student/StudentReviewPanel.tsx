import style from "./StudentReviewPanel.module.css";
import { IoClose } from "react-icons/io5";

type Props = {
  studentName: string;
  onClose: () => void;
};

export default function StudentReviewPanel({ studentName, onClose }: Props) {
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
          <h3 className={style.studentName}>{studentName}</h3>
          <p className={style.infoText}>
            No hay información de progreso disponible aún.
          </p>
        </div>
      </div>
    </div>
  );
}
