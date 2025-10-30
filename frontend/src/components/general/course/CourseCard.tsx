import styles from "./CourseCard.module.css";
import { IoClose, IoSettingsSharp, IoBookOutline } from "react-icons/io5";
import toast from "react-hot-toast";

type Props = {
  title: string;
  author?: string;
  description?: string;
  progress: number;
  color?: string;
  icon?: "close" | "settings";
  variant?: "default" | "compact";
  logo_path?: string;
  onDelete?: () => void;
  canDelete?: boolean;
  onIconClick?: () => void;
};

export default function CourseCard({
  title,
  author,
  description,
  progress,
  color = "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
  icon = "close",
  variant = "default",
  logo_path,
  onDelete,
  canDelete = true,
  onIconClick,
}: Props) {
  const isCompact = variant === "compact";

  const handleIconClick = () => {
    if (icon === "close") {
      if (!canDelete) {
        toast.error("Solo el tutor del curso puede eliminar estudiantes");
        return;
      }
      if (
        onDelete &&
        confirm(`¿Estás seguro de que quieres desinscribirte de "${title}"?`)
      ) {
        onDelete();
        toast.success("Te has desinscrito del curso");
      }
    } else if (icon === "settings") {
      if (onIconClick) {
        onIconClick();
      } else {
        toast("Abriendo configuración...");
      }
    }
  };

  return (
    <div
      className={`${styles.card} ${isCompact ? styles.compact : ""}`}
      style={{ background: color }}
    >
      {/* Botón superior */}
      <button className={styles.iconBtn} onClick={handleIconClick}>
        {icon === "close" ? (
          <IoClose size={20} />
        ) : (
          <IoSettingsSharp size={20} />
        )}
      </button>

      {/* Logo o icono */}
      <div className={styles.logoContainer}>
        {logo_path ? (
          <img
            src={logo_path}
            alt={title}
            className={styles.logo}
            loading="lazy"
          />
        ) : (
          <IoBookOutline className={styles.logoIcon} />
        )}
      </div>

      <h3 className={styles.title}>{title}</h3>

      {!isCompact && author && <p className={styles.author}>{author}</p>}
      {!isCompact && description && (
        <p className={styles.desc}>{description}</p>
      )}

      <div className={styles.progressBar}>
        <div style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.progressText}>{progress}%</p>
    </div>
  );
}
