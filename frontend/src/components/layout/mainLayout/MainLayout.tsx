import Navbar from "../../general/navbar/Navbar";
import Footer from "../../general/footer/Footer";
import styles from "./MainLayout.module.css";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <header>
        <Navbar />
      </header>
      <main className={styles["main-content"]}>{children}</main>
      <Footer />
    </div>
  );
}
