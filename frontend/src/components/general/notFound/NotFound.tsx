import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

function NotFound() {
  return (
    <div className={styles["not-found-contenedor"]}>
      <h1 className={styles["not-found__titulo"]}>Error 404</h1>
      <h2 className={styles["not-found__subtitulo"]}>
        Lo sentimos, puedes dar click{" "}
        <Link to="/" className={styles["not-found__link"]}>
          aquí
        </Link>{" "}
        para volver
      </h2>
    </div>
  );
}

export default NotFound;
