import { useEffect, useState } from "react";
import { IoClose, IoSettingsSharp, IoBookOutline } from "react-icons/io5";
import styles from "./CourseCard.module.css";

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
  onIconClick?: () => void;
  onClick?: () => void;
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
  onIconClick,
  onClick,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const isCompact = variant === "compact";

  useEffect(() => {
    setImageError(false);
  }, [logo_path]);

  return (
    <div
      className={`${styles.card} ${isCompact ? styles.compact : ""}`}
      style={{ background: color }}
      onClick={onClick}
    >
      {/* Botón de acción */}
      <button
        className={styles.iconBtn}
        onClick={(e) => {
          e.stopPropagation();
          if (icon === "close") onDelete?.();
          else onIconClick?.();
        }}
      >
        {icon === "close" ? (
          <IoClose size={20} />
        ) : (
          <IoSettingsSharp size={20} />
        )}
      </button>

      {/* Logo */}
      <div className={styles.logoContainer}>
        {logo_path && !imageError ? (
          <img
            key={logo_path}
            src={logo_path}
            alt={title}
            className={styles.logo}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <IoBookOutline className={styles.logoIcon} />
        )}
      </div>

      {/* Contenido */}
      <h3 className={styles.title}>{title}</h3>
      {!isCompact && author && <p className={styles.author}>{author}</p>}
      {!isCompact && description && (
        <p className={styles.desc}>{description}</p>
      )}

      {/* Barra de progreso */}
      <div className={styles.progressBar}>
        <div style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.progressText}>{progress}%</p>
    </div>
  );
}
