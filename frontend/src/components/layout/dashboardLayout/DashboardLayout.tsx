import Sidebar from "../../general/sidebar/Sidebar";
import styles from "./DashboardLayout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        {/* Burbujas */}
        <div className={styles.bubbles}>
          {/* burbujas grandes */}
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          {/* burbujas pequeñas */}
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
        </div>
        <div className={styles.innerContent}>{children}</div>
      </main>
    </div>
  );
}
