import styles from "./CourseCard.module.css";
import { IoClose, IoSettingsSharp } from "react-icons/io5";

type Props = {
  title: string;
  author: string;
  description: string;
  progress: number;
  color?: string;
  icon?: "close" | "settings";
};

export default function CourseCard({
  title,
  author,
  description,
  progress,
  color = "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
  icon = "close",
}: Props) {
  return (
    <div className={styles.card} style={{ background: color }}>
      <button className={styles.iconBtn}>
        {icon === "close" ? (
          <IoClose size={18} />
        ) : (
          <IoSettingsSharp size={18} />
        )}
      </button>

      <h3>{title}</h3>
      <p className={styles.author}>{author}</p>
      <p className={styles.desc}>{description}</p>

      <div className={styles.progressBar}>
        <div style={{ width: `${progress}%` }} />
      </div>
      <span className={styles.progressText}>{progress}%</span>
    </div>
  );
}
